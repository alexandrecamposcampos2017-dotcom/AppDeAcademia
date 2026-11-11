import { Router } from "express";
import { z } from "zod";
import { prisma } from "./db.js";
import { requireAuth } from "./auth.js";

export const fitnessRouter = Router();
fitnessRouter.use(requireAuth);

const dateInput = z.coerce.date();
const pastDateInput = dateInput.refine((value) => value <= new Date(), "A data não pode estar no futuro.");
const optionalText = z.string().trim().max(1000).optional().nullable();
const profileImageData = z.string().max(700_000).refine((value) => {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return false;
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 512 * 1024 || bytes.toString("base64") !== match[2]) return false;
  if (match[1] === "jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (match[1] === "png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}, "Envie uma imagem JPEG, PNG ou WebP válida com no máximo 512 KB.");

fitnessRouter.get("/profile", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, profile: true },
  });
  if (!user) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }
  res.json(user);
});

fitnessRouter.patch("/profile", async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(80).optional(),
    age: z.number().int().min(13).max(120).nullable().optional(),
    heightCm: z.number().min(50).max(260).nullable().optional(),
    weightKg: z.number().min(20).max(500).nullable().optional(),
    goal: z.enum(["emagrecimento", "hipertrofia", "condicionamento", "saude"]).nullable().optional(),
    experience: z.enum(["iniciante", "intermediario", "avancado"]).nullable().optional(),
    preferences: optionalText,
    theme: z.enum(["light", "dark"]).optional(),
    isPrivate: z.boolean().optional(),
    avatarData: profileImageData.nullable().optional(),
  }).parse(req.body);
  const { name, ...profile } = input;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name ? { name } : {}),
      profile: { upsert: { create: profile, update: profile } },
    },
    select: { id: true, name: true, email: true, profile: true },
  });
  res.json(user);
});

fitnessRouter.get("/exercises", async (req, res) => {
  const query = z.object({
    search: z.string().trim().max(80).optional(),
    muscleGroup: z.string().trim().max(60).optional(),
  }).parse(req.query);
  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [{ createdById: null }, { createdById: req.userId }],
      ...(query.muscleGroup ? { muscleGroup: query.muscleGroup } : {}),
      ...(query.search
        ? { name: { contains: query.search } }
        : {}),
    },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    take: 200,
  });
  res.json(exercises);
});

fitnessRouter.post("/exercises", async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100),
    muscleGroup: z.string().trim().min(2).max(60),
    type: z.string().trim().min(2).max(60),
    equipment: z.string().trim().max(80).optional().nullable(),
    level: z.string().trim().max(40).default("Iniciante"),
    modality: z.string().trim().max(60).default("Musculação"),
    description: z.string().trim().min(2).max(1000),
    instructions: z.string().trim().min(2).max(2000),
  }).parse(req.body);
  const exercise = await prisma.exercise.create({
    data: { ...input, createdById: req.userId },
  });
  res.status(201).json(exercise);
});

fitnessRouter.delete("/exercises/:id", async (req, res) => {
  const exercise = await prisma.exercise.findFirst({
    where: { id: req.params.id, createdById: req.userId },
  });
  if (!exercise) {
    res.status(404).json({ error: "Exercício personalizado não encontrado." });
    return;
  }
  const usage = await prisma.workoutExercise.findFirst({ where: { exerciseId: exercise.id }, select: { id: true } })
    ?? await prisma.workoutSet.findFirst({ where: { exerciseId: exercise.id }, select: { id: true } });
  if (usage) {
    res.status(409).json({ error: "Este exercício faz parte de um treino ou histórico. Remova os vínculos antes de excluí-lo." });
    return;
  }
  await prisma.exercise.delete({ where: { id: exercise.id } });
  res.status(204).end();
});

fitnessRouter.get("/workouts", async (req, res) => {
  const workouts = await prisma.workoutPlan.findMany({
    where: { ownerId: req.userId },
    include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
  });
  res.json(workouts);
});

fitnessRouter.post("/workouts", async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100),
    muscleGroup: z.string().trim().max(60).optional().nullable(),
    description: optionalText,
  }).parse(req.body);
  const workout = await prisma.workoutPlan.create({
    data: { ...input, ownerId: req.userId },
    include: { exercises: { include: { exercise: true } } },
  });
  res.status(201).json(workout);
});

fitnessRouter.patch("/workouts/:id", async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    muscleGroup: z.string().trim().max(60).nullable().optional(),
    description: optionalText,
    isFavorite: z.boolean().optional(),
  }).parse(req.body);
  const result = await prisma.workoutPlan.updateMany({
    where: { id: req.params.id, ownerId: req.userId },
    data: input,
  });
  if (!result.count) {
    res.status(404).json({ error: "Treino não encontrado." });
    return;
  }
  res.json(await prisma.workoutPlan.findUnique({
    where: { id: req.params.id },
    include: { exercises: { include: { exercise: true } } },
  }));
});

fitnessRouter.delete("/workouts/:id", async (req, res) => {
  const result = await prisma.workoutPlan.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!result.count) {
    res.status(404).json({ error: "Treino não encontrado." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.post("/workouts/:id/exercises", async (req, res) => {
  const input = z.object({
    exerciseId: z.string().min(1),
    sets: z.number().int().min(1).max(30).default(3),
    reps: z.number().int().min(1).max(100).default(10),
    loadKg: z.number().min(0).max(1000).nullable().optional(),
    restSeconds: z.number().int().min(0).max(3600).default(60),
  }).parse(req.body);
  const plan = await prisma.workoutPlan.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!plan) {
    res.status(404).json({ error: "Treino não encontrado." });
    return;
  }
  const exercise = await prisma.exercise.findFirst({
    where: { id: input.exerciseId, OR: [{ createdById: null }, { createdById: req.userId }] },
    select: { id: true },
  });
  if (!exercise) {
    res.status(404).json({ error: "Exercício não encontrado na sua biblioteca." });
    return;
  }
  const item = await prisma.workoutExercise.create({
    data: {
      planId: plan.id,
      ...input,
      sortOrder: await prisma.workoutExercise.count({ where: { planId: plan.id } }),
    },
    include: { exercise: true },
  });
  res.status(201).json(item);
});

fitnessRouter.delete("/workouts/:id/exercises/:itemId", async (req, res) => {
  const item = await prisma.workoutExercise.findFirst({
    where: {
      id: req.params.itemId,
      planId: req.params.id,
      plan: { ownerId: req.userId },
    },
  });
  if (!item) {
    res.status(404).json({ error: "Exercício do treino não encontrado." });
    return;
  }
  await prisma.workoutExercise.delete({ where: { id: item.id } });
  res.status(204).end();
});

fitnessRouter.get("/workout-logs", async (req, res) => {
  const logs = await prisma.workoutLog.findMany({
    where: { ownerId: req.userId },
    include: { sets: { include: { exercise: true } } },
    orderBy: { startedAt: "desc" },
    take: 100,
  });
  res.json(logs);
});

fitnessRouter.post("/workout-logs", async (req, res) => {
  const input = z.object({
    planId: z.string().optional().nullable(),
    name: z.string().trim().min(2).max(100),
    startedAt: pastDateInput.optional(),
    durationMinutes: z.number().int().min(1).max(1440),
    notes: optionalText,
    sets: z.array(z.object({
      exerciseId: z.string().min(1),
      setNumber: z.number().int().min(1).max(30),
      reps: z.number().int().min(1).max(100),
      loadKg: z.number().min(0).max(1000).nullable().optional(),
    })).max(200).default([]),
  }).parse(req.body);
  if (input.planId) {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: input.planId, ownerId: req.userId },
      include: { exercises: { select: { exerciseId: true } } },
    });
    if (!plan) {
      res.status(404).json({ error: "Treino não encontrado." });
      return;
    }
    const allowed = new Set(plan.exercises.map((item) => item.exerciseId));
    if (input.sets.some((set) => !allowed.has(set.exerciseId))) {
      res.status(400).json({ error: "O registro inclui exercícios fora do treino selecionado." });
      return;
    }
  } else if (input.sets.length) {
    const accessibleExercises = await prisma.exercise.findMany({
      where: {
        id: { in: input.sets.map((set) => set.exerciseId) },
        OR: [{ createdById: null }, { createdById: req.userId }],
      },
      select: { id: true },
    });
    if (new Set(accessibleExercises.map((exercise) => exercise.id)).size !== new Set(input.sets.map((set) => set.exerciseId)).size) {
      res.status(404).json({ error: "Um ou mais exercícios não estão disponíveis na sua biblioteca." });
      return;
    }
  }
  const log = await prisma.workoutLog.create({
    data: {
      ownerId: req.userId,
      planId: input.planId,
      name: input.name,
      startedAt: input.startedAt,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
      sets: { create: input.sets },
    },
    include: { sets: { include: { exercise: true } } },
  });
  res.status(201).json(log);
});

fitnessRouter.get("/activities", async (req, res) => {
  const activities = await prisma.activity.findMany({
    where: { ownerId: req.userId },
    orderBy: { date: "desc" },
    take: 200,
  });
  res.json(activities);
});

fitnessRouter.post("/activities", async (req, res) => {
  const input = z.object({
    type: z.string().trim().min(2).max(60),
    durationMinutes: z.number().int().min(1).max(1440),
    distanceKm: z.number().min(0).max(1000).nullable().optional(),
    calories: z.number().int().min(0).max(10000).nullable().optional(),
    intensity: z.enum(["baixa", "moderada", "alta"]).nullable().optional(),
    date: pastDateInput.optional(),
    notes: optionalText,
  }).parse(req.body);
  const activity = await prisma.activity.create({
    data: { ...input, ownerId: req.userId },
  });
  res.status(201).json(activity);
});

fitnessRouter.patch("/activities/:id", async (req, res) => {
  const input = z.object({
    type: z.string().trim().min(2).max(60).optional(),
    durationMinutes: z.number().int().min(1).max(1440).optional(),
    distanceKm: z.number().min(0).max(1000).nullable().optional(),
    calories: z.number().int().min(0).max(10000).nullable().optional(),
    intensity: z.enum(["baixa", "moderada", "alta"]).nullable().optional(),
    date: pastDateInput.optional(),
    notes: optionalText,
  }).parse(req.body);
  const updated = await prisma.activity.updateMany({
    where: { id: req.params.id, ownerId: req.userId },
    data: input,
  });
  if (!updated.count) {
    res.status(404).json({ error: "Atividade não encontrada." });
    return;
  }
  res.json(await prisma.activity.findUnique({ where: { id: req.params.id } }));
});

fitnessRouter.delete("/activities/:id", async (req, res) => {
  const deleted = await prisma.activity.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Atividade não encontrada." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.get("/measurements", async (req, res) => {
  res.json(await prisma.bodyMeasurement.findMany({
    where: { ownerId: req.userId },
    orderBy: { date: "desc" },
    take: 200,
  }));
});

fitnessRouter.post("/measurements", async (req, res) => {
  const input = z.object({
    date: dateInput.optional(),
    weightKg: z.number().min(20).max(500).nullable().optional(),
    heightCm: z.number().min(50).max(260).nullable().optional(),
    bodyFatPct: z.number().min(0).max(80).nullable().optional(),
    muscleMassKg: z.number().min(0).max(300).nullable().optional(),
    waistCm: z.number().min(20).max(300).nullable().optional(),
    chestCm: z.number().min(20).max(300).nullable().optional(),
    armCm: z.number().min(5).max(150).nullable().optional(),
    thighCm: z.number().min(10).max(200).nullable().optional(),
  }).parse(req.body);
  const measurement = await prisma.bodyMeasurement.create({
    data: { ...input, ownerId: req.userId },
  });
  const height = measurement.heightCm ?? (await prisma.profile.findUnique({
    where: { userId: req.userId },
    select: { heightCm: true },
  }))?.heightCm;
  res.status(201).json({
    ...measurement,
    bmi: measurement.weightKg && height ? Number((measurement.weightKg / (height / 100) ** 2).toFixed(1)) : null,
  });
});

fitnessRouter.delete("/measurements/:id", async (req, res) => {
  const deleted = await prisma.bodyMeasurement.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Medição não encontrada." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.get("/goals", async (req, res) => {
  res.json(await prisma.goal.findMany({
    where: { ownerId: req.userId },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  }));
});

fitnessRouter.post("/goals", async (req, res) => {
  const input = z.object({
    type: z.enum(["workouts", "distance", "activity_minutes", "calories", "hydration_ml"]),
    target: z.number().positive().max(1_000_000),
    unit: z.string().trim().min(1).max(30),
    period: z.enum(["daily", "weekly", "monthly"]),
    startDate: dateInput.optional(),
    endDate: dateInput.nullable().optional(),
    active: z.boolean().default(true),
  }).parse(req.body);
  const goal = await prisma.goal.create({
    data: { ...input, ownerId: req.userId },
  });
  res.status(201).json(goal);
});

fitnessRouter.patch("/goals/:id", async (req, res) => {
  const input = z.object({
    target: z.number().positive().max(1_000_000).optional(),
    active: z.boolean().optional(),
    endDate: dateInput.nullable().optional(),
  }).parse(req.body);
  const updated = await prisma.goal.updateMany({
    where: { id: req.params.id, ownerId: req.userId },
    data: input,
  });
  if (!updated.count) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }
  res.json(await prisma.goal.findUnique({ where: { id: req.params.id } }));
});

fitnessRouter.delete("/goals/:id", async (req, res) => {
  const deleted = await prisma.goal.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Meta não encontrada." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.get("/schedule", async (req, res) => {
  res.json(await prisma.scheduledWorkout.findMany({
    where: { ownerId: req.userId },
    orderBy: { scheduledAt: "asc" },
    take: 200,
  }));
});

fitnessRouter.post("/schedule", async (req, res) => {
  const input = z.object({
    title: z.string().trim().min(2).max(100),
    type: z.string().trim().min(2).max(60),
    scheduledAt: dateInput,
    notes: optionalText,
    workoutPlanId: z.string().nullable().optional(),
  }).parse(req.body);
  if (input.workoutPlanId) {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: input.workoutPlanId, ownerId: req.userId },
    });
    if (!plan) {
      res.status(404).json({ error: "Treino associado não encontrado." });
      return;
    }
  }
  const schedule = await prisma.scheduledWorkout.create({
    data: { ...input, ownerId: req.userId },
  });
  res.status(201).json(schedule);
});

fitnessRouter.patch("/schedule/:id", async (req, res) => {
  const input = z.object({
    title: z.string().trim().min(2).max(100).optional(),
    type: z.string().trim().min(2).max(60).optional(),
    scheduledAt: dateInput.optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
    notes: optionalText,
  }).parse(req.body);
  const updated = await prisma.scheduledWorkout.updateMany({
    where: { id: req.params.id, ownerId: req.userId },
    data: input,
  });
  if (!updated.count) {
    res.status(404).json({ error: "Agendamento não encontrado." });
    return;
  }
  res.json(await prisma.scheduledWorkout.findUnique({ where: { id: req.params.id } }));
});

fitnessRouter.delete("/schedule/:id", async (req, res) => {
  const deleted = await prisma.scheduledWorkout.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Agendamento não encontrado." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.get("/foods", async (req, res) => {
  res.json(await prisma.food.findMany({
    where: { ownerId: req.userId },
    orderBy: { name: "asc" },
    take: 200,
  }));
});

fitnessRouter.post("/foods", async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100),
    calories: z.number().min(0).max(10000).default(0),
    proteinG: z.number().min(0).max(1000).default(0),
    carbsG: z.number().min(0).max(2000).default(0),
    fatG: z.number().min(0).max(1000).default(0),
  }).parse(req.body);
  const food = await prisma.food.create({ data: { ...input, ownerId: req.userId } });
  res.status(201).json(food);
});

fitnessRouter.delete("/foods/:id", async (req, res) => {
  const deleted = await prisma.food.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Alimento salvo não encontrado." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.get("/meals", async (req, res) => {
  res.json(await prisma.meal.findMany({
    where: { ownerId: req.userId },
    orderBy: { recordedAt: "desc" },
    take: 200,
  }));
});

fitnessRouter.post("/meals", async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100),
    mealType: z.enum(["cafe_da_manha", "almoco", "jantar", "lanche", "outro"]),
    recordedAt: pastDateInput.optional(),
    foodId: z.string().nullable().optional(),
    amountG: z.number().min(0.1).max(10000).default(100),
    calories: z.number().min(0).max(20000).default(0),
    proteinG: z.number().min(0).max(1000).default(0),
    carbsG: z.number().min(0).max(2000).default(0),
    fatG: z.number().min(0).max(1000).default(0),
    notes: optionalText,
  }).parse(req.body);
  const food = input.foodId ? await prisma.food.findFirst({
    where: { id: input.foodId, ownerId: req.userId },
  }) : null;
  if (input.foodId && !food) {
    res.status(404).json({ error: "Alimento não encontrado na sua lista pessoal." });
    return;
  }
  const factor = input.amountG / 100;
  const meal = await prisma.meal.create({
    data: {
      ownerId: req.userId,
      name: input.name,
      mealType: input.mealType,
      recordedAt: input.recordedAt,
      calories: food ? food.calories * factor : input.calories,
      proteinG: food ? food.proteinG * factor : input.proteinG,
      carbsG: food ? food.carbsG * factor : input.carbsG,
      fatG: food ? food.fatG * factor : input.fatG,
      notes: input.notes,
    },
  });
  res.status(201).json(meal);
});

fitnessRouter.delete("/meals/:id", async (req, res) => {
  const deleted = await prisma.meal.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Refeição não encontrada." });
    return;
  }
  res.status(204).end();
});

fitnessRouter.get("/water", async (req, res) => {
  const entries = await prisma.waterEntry.findMany({
    where: { ownerId: req.userId },
    orderBy: { recordedAt: "desc" },
    take: 200,
  });
  res.json(entries);
});

fitnessRouter.post("/water", async (req, res) => {
  const input = z.object({
    amountMl: z.number().int().min(1).max(10000),
    recordedAt: pastDateInput.optional(),
  }).parse(req.body);
  const entry = await prisma.waterEntry.create({
    data: { ...input, ownerId: req.userId },
  });
  res.status(201).json(entry);
});

fitnessRouter.delete("/water/:id", async (req, res) => {
  const deleted = await prisma.waterEntry.deleteMany({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!deleted.count) {
    res.status(404).json({ error: "Registro de água não encontrado." });
    return;
  }
  res.status(204).end();
});

function startOfUtcPeriod(period: "daily" | "weekly" | "monthly", now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === "weekly") {
    const day = start.getUTCDay() || 7;
    start.setUTCDate(start.getUTCDate() - day + 1);
  } else if (period === "monthly") {
    start.setUTCDate(1);
  }
  return start;
}

function startOfUserPeriod(period: "daily" | "weekly" | "monthly", now: Date, offsetMinutes: number) {
  const localNow = new Date(now.getTime() + offsetMinutes * 60_000);
  return new Date(startOfUtcPeriod(period, localNow).getTime() - offsetMinutes * 60_000);
}

fitnessRouter.get("/dashboard", async (req, res) => {
  const offsetMinutes = z.coerce.number().int().min(-840).max(840).default(0).parse(req.query.offset);
  const now = new Date();
  const today = startOfUserPeriod("daily", now, offsetMinutes);
  const week = startOfUserPeriod("weekly", now, offsetMinutes);
  const month = startOfUserPeriod("monthly", now, offsetMinutes);
  const [activities, workouts, scheduled, goals, meals, water, recentActivities, recentLogs] = await Promise.all([
    prisma.activity.findMany({ where: { ownerId: req.userId, date: { gte: month } } }),
    prisma.workoutLog.findMany({ where: { ownerId: req.userId, startedAt: { gte: month } } }),
    prisma.scheduledWorkout.findMany({
      where: { ownerId: req.userId, scheduledAt: { gte: today }, status: "scheduled" },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.goal.findMany({ where: { ownerId: req.userId, active: true } }),
    prisma.meal.findMany({ where: { ownerId: req.userId, recordedAt: { gte: today } } }),
    prisma.waterEntry.findMany({ where: { ownerId: req.userId, recordedAt: { gte: month } } }),
    prisma.activity.findMany({ where: { ownerId: req.userId }, orderBy: { date: "desc" }, take: 5 }),
    prisma.workoutLog.findMany({ where: { ownerId: req.userId }, orderBy: { startedAt: "desc" }, take: 5 }),
  ]);
  const activeActivities = activities.filter((activity) => activity.date <= now);
  const activeWorkouts = workouts.filter((workout) => workout.startedAt <= now);
  const todayActivities = activeActivities.filter((activity) => activity.date >= today);
  const todayWorkouts = activeWorkouts.filter((workout) => workout.startedAt >= today);
  const weekActivities = activeActivities.filter((activity) => activity.date >= week);
  const weekWorkouts = activeWorkouts.filter((workout) => workout.startedAt >= week);
  const todayWater = water.filter((entry) => entry.recordedAt >= today);
  const waterMl = todayWater.reduce((sum, entry) => sum + entry.amountMl, 0);
  const activityMinutes = todayActivities.reduce((sum, activity) => sum + activity.durationMinutes, 0)
    + todayWorkouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
  const distanceKm = todayActivities.reduce((sum, activity) => sum + (activity.distanceKm ?? 0), 0);
  const caloriesBurned = todayActivities.reduce((sum, activity) => sum + (activity.calories ?? 0), 0);
  const mealsCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const progress = goals.map((goal) => {
    const start = startOfUserPeriod(goal.period as "daily" | "weekly" | "monthly", now, offsetMinutes);
    const value = goal.type === "workouts"
      ? activeWorkouts.filter((workout) => workout.startedAt >= start).length
      : goal.type === "distance"
        ? activeActivities.filter((activity) => activity.date >= start).reduce((sum, activity) => sum + (activity.distanceKm ?? 0), 0)
        : goal.type === "activity_minutes"
          ? activeActivities.filter((activity) => activity.date >= start).reduce((sum, activity) => sum + activity.durationMinutes, 0)
          : goal.type === "calories"
            ? activeActivities.filter((activity) => activity.date >= start).reduce((sum, activity) => sum + (activity.calories ?? 0), 0)
            : water.filter((entry) => entry.recordedAt >= start).reduce((sum, entry) => sum + entry.amountMl, 0);
    return { ...goal, current: value, percent: Math.min(100, Math.round((value / goal.target) * 100)) };
  });
  res.json({
    today: { activityMinutes, distanceKm, caloriesBurned, workouts: todayWorkouts.length, mealsCalories, waterMl },
    week: {
      workouts: weekWorkouts.length,
      activityMinutes: weekActivities.reduce((sum, item) => sum + item.durationMinutes, 0)
        + weekWorkouts.reduce((sum, item) => sum + item.durationMinutes, 0),
      distanceKm: weekActivities.reduce((sum, item) => sum + (item.distanceKm ?? 0), 0),
    },
    scheduled,
    goals: progress,
    recent: [
      ...recentActivities.map((item) => ({ id: item.id, kind: "activity", title: item.type, date: item.date, detail: `${item.durationMinutes} min` })),
      ...recentLogs.map((item) => ({ id: item.id, kind: "workout", title: item.name, date: item.startedAt, detail: `${item.durationMinutes} min` })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
  });
});

fitnessRouter.get("/achievements", async (req, res) => {
  const offsetMinutes = z.coerce.number().int().min(-840).max(840).default(0).parse(req.query.offset);
  const now = new Date();
  const currentDay = startOfUserPeriod("daily", now, offsetMinutes);
  const from = new Date(currentDay);
  from.setUTCDate(from.getUTCDate() - 365);
  const [workoutCount, activityCount, workouts, activities] = await Promise.all([
    prisma.workoutLog.count({ where: { ownerId: req.userId } }),
    prisma.activity.count({ where: { ownerId: req.userId } }),
    prisma.workoutLog.findMany({ where: { ownerId: req.userId, startedAt: { gte: from } }, select: { startedAt: true } }),
    prisma.activity.findMany({ where: { ownerId: req.userId, date: { gte: from } }, select: { date: true } }),
  ]);
  const activeDays = new Set([
    ...workouts.map((item) => startOfUserPeriod("daily", item.startedAt, offsetMinutes).toISOString()),
    ...activities.map((item) => startOfUserPeriod("daily", item.date, offsetMinutes).toISOString()),
  ]);
  const orderedDays = [...activeDays].sort();
  let longestStreak = 0;
  let streak = 0;
  let previousDay: Date | null = null;
  for (const dayText of orderedDays) {
    const day = new Date(dayText);
    streak = previousDay && day.getTime() - previousDay.getTime() === 24 * 60 * 60 * 1000 ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
    previousDay = day;
  }
  let currentStreak = 0;
  let cursor = new Date(currentDay);
  if (!activeDays.has(cursor.toISOString())) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activeDays.has(cursor.toISOString())) {
    currentStreak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const achievements = [
    { id: "first-activity", title: "Primeiro movimento", description: "Registre sua primeira atividade.", current: Math.min(1, activityCount), target: 1 },
    { id: "five-workouts", title: "Ritmo constante", description: "Conclua 5 treinos.", current: Math.min(5, workoutCount), target: 5 },
    { id: "twenty-five-workouts", title: "Força de hábito", description: "Conclua 25 treinos.", current: Math.min(25, workoutCount), target: 25 },
    { id: "three-day-streak", title: "Três dias ativos", description: "Mantenha uma sequência de 3 dias.", current: Math.min(3, longestStreak), target: 3 },
    { id: "seven-day-streak", title: "Semana em movimento", description: "Mantenha uma sequência de 7 dias.", current: Math.min(7, longestStreak), target: 7 },
  ].map((item) => ({ ...item, unlocked: item.current >= item.target }));
  res.json({ currentStreak, longestStreak, achievements });
});

fitnessRouter.get("/reports", async (req, res) => {
  const query = z.object({ period: z.enum(["week", "month", "year"]).default("month") }).parse(req.query);
  const now = new Date();
  const start = query.period === "week"
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : query.period === "year"
      ? new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [activities, workouts, measurements, meals] = await Promise.all([
    prisma.activity.findMany({ where: { ownerId: req.userId, date: { gte: start } }, orderBy: { date: "asc" } }),
    prisma.workoutLog.findMany({ where: { ownerId: req.userId, startedAt: { gte: start } }, orderBy: { startedAt: "asc" } }),
    prisma.bodyMeasurement.findMany({ where: { ownerId: req.userId, date: { gte: start } }, orderBy: { date: "asc" } }),
    prisma.meal.findMany({ where: { ownerId: req.userId, recordedAt: { gte: start } } }),
  ]);
  res.json({
    period: query.period,
    from: start,
    totals: {
      activityMinutes: activities.reduce((sum, item) => sum + item.durationMinutes, 0)
        + workouts.reduce((sum, item) => sum + item.durationMinutes, 0),
      caloriesBurned: activities.reduce((sum, item) => sum + (item.calories ?? 0), 0),
      distanceKm: activities.reduce((sum, item) => sum + (item.distanceKm ?? 0), 0),
      workouts: workouts.length,
      mealsCalories: meals.reduce((sum, item) => sum + item.calories, 0),
    },
    activities,
    workouts,
    measurements,
  });
});

function csvCell(value: unknown) {
  let text = value == null ? "" : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

fitnessRouter.get("/reports/export.csv", async (req, res) => {
  const query = z.object({ type: z.enum(["activities", "measurements", "workouts"]).default("activities") }).parse(req.query);
  let headers: string[];
  let rows: unknown[][];
  if (query.type === "activities") {
    const records = await prisma.activity.findMany({ where: { ownerId: req.userId }, orderBy: { date: "desc" } });
    headers = ["data", "modalidade", "duracao_minutos", "distancia_km", "calorias", "intensidade", "observacoes"];
    rows = records.map((item) => [item.date, item.type, item.durationMinutes, item.distanceKm, item.calories, item.intensity, item.notes]);
  } else if (query.type === "measurements") {
    const records = await prisma.bodyMeasurement.findMany({ where: { ownerId: req.userId }, orderBy: { date: "desc" } });
    headers = ["data", "peso_kg", "altura_cm", "gordura_percentual", "massa_muscular_kg", "cintura_cm", "peito_cm", "braco_cm", "coxa_cm"];
    rows = records.map((item) => [item.date, item.weightKg, item.heightCm, item.bodyFatPct, item.muscleMassKg, item.waistCm, item.chestCm, item.armCm, item.thighCm]);
  } else {
    const records = await prisma.workoutLog.findMany({ where: { ownerId: req.userId }, orderBy: { startedAt: "desc" } });
    headers = ["data", "treino", "duracao_minutos", "observacoes"];
    rows = records.map((item) => [item.startedAt, item.name, item.durationMinutes, item.notes]);
  }
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  res.type("text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="fittrack-${query.type}.csv"`);
  res.send(`\uFEFF${csv}`);
});
