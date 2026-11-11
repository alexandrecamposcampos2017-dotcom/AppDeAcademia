import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import { app } from "./app.js";
import { prisma } from "./db.js";

after(async () => {
  await prisma.$disconnect();
});

test("authenticates users, persists fitness data, validates input and isolates accounts", async () => {
  await prisma.user.deleteMany();
  await prisma.exercise.deleteMany({ where: { createdById: { not: null } } });
  const testExercise = await prisma.exercise.upsert({
    where: { id: "test-global-bench" },
    create: {
      id: "test-global-bench",
      name: "Supino reto",
      muscleGroup: "Peito",
      type: "Composto",
      level: "Iniciante",
      modality: "Musculação",
      description: "Exercício de teste.",
      instructions: "Execução controlada.",
    },
    update: {},
  });

  const firstUser = request.agent(app);
  const firstRegistration = await firstUser.post("/api/auth/register").send({
    name: "Ana Exemplo",
    email: "ana@example.test",
    password: "senha-segura-123",
  });
  assert.equal(firstRegistration.status, 201);
  assert.equal(firstRegistration.body.user.email, "ana@example.test");
  assert.ok(firstRegistration.body.user.profile);

  const avatarData = `data:image/webp;base64,${Buffer.from("RIFF0000WEBPtest").toString("base64")}`;
  const savedAvatar = await firstUser.patch("/api/profile").send({ avatarData });
  assert.equal(savedAvatar.status, 200);
  assert.equal(savedAvatar.body.profile.avatarData, avatarData);
  const persistedAvatar = await firstUser.get("/api/profile");
  assert.equal(persistedAvatar.body.profile.avatarData, avatarData);
  const invalidAvatar = await firstUser.patch("/api/profile").send({ avatarData: "data:image/svg+xml;base64,PHN2Zz4=" });
  assert.equal(invalidAvatar.status, 400);

  const unauthenticated = await request(app).get("/api/activities");
  assert.equal(unauthenticated.status, 401);
  for (let attempt = 0; attempt < 31; attempt++) {
    assert.equal((await request(app).get("/api/auth/me")).status, 401);
  }

  const invalidActivity = await firstUser.post("/api/activities").send({
    type: "Corrida",
    durationMinutes: -3,
  });
  assert.equal(invalidActivity.status, 400);

  const futureActivity = await firstUser.post("/api/activities").send({
    type: "Corrida",
    durationMinutes: 200,
    date: new Date(Date.now() + 60_000).toISOString(),
  });
  assert.equal(futureActivity.status, 400);
  assert.equal(futureActivity.body.error, "A data não pode estar no futuro.");

  const activityResponse = await firstUser.post("/api/activities").send({
    type: "Caminhada",
    durationMinutes: 35,
    distanceKm: 2.4,
    calories: 160,
    date: "2026-11-02T18:00:00.000Z",
  });
  assert.equal(activityResponse.status, 201);
  const activityId = activityResponse.body.id as string;
  assert.ok(activityId);

  const foodResponse = await firstUser.post("/api/foods").send({
    name: "Alimento de teste",
    calories: 180,
    proteinG: 12,
    carbsG: 20,
    fatG: 5,
  });
  assert.equal(foodResponse.status, 201);
  const mealResponse = await firstUser.post("/api/meals").send({
    name: "Lanche",
    mealType: "lanche",
    foodId: foodResponse.body.id,
    amountG: 150,
  });
  assert.equal(mealResponse.status, 201);
  assert.equal(mealResponse.body.calories, 270);
  assert.equal(mealResponse.body.proteinG, 18);

  const privateExercise = await firstUser.post("/api/exercises").send({
    name: "Exercício privado",
    muscleGroup: "Costas",
    type: "Composto",
    equipment: "Halter",
    description: "Exercício exclusivo desta conta.",
    instructions: "Execução de teste controlada.",
  });
  assert.equal(privateExercise.status, 201);

  const storedActivities = await firstUser.get("/api/activities");
  assert.equal(storedActivities.status, 200);
  assert.equal(storedActivities.body.length, 1);
  assert.equal(storedActivities.body[0].distanceKm, 2.4);

  const planResponse = await firstUser.post("/api/workouts").send({
    name: "Treino de peito",
    muscleGroup: "Peito",
  });
  assert.equal(planResponse.status, 201);
  const planId = planResponse.body.id as string;
  const planExercise = await firstUser.post(`/api/workouts/${planId}/exercises`).send({
    exerciseId: testExercise.id,
    sets: 3,
    reps: 10,
    loadKg: 20,
    restSeconds: 60,
  });
  assert.equal(planExercise.status, 201);

  const completedWorkout = await firstUser.post("/api/workout-logs").send({
    planId,
    name: "Treino de peito",
    durationMinutes: 48,
    sets: [{ exerciseId: testExercise.id, setNumber: 1, reps: 10, loadKg: 20 }],
  });
  assert.equal(completedWorkout.status, 201);
  const dashboard = await firstUser.get("/api/dashboard");
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.body.today.workouts, 1);

  const secondUser = request.agent(app);
  const secondRegistration = await secondUser.post("/api/auth/register").send({
    name: "Bruno Exemplo",
    email: "bruno@example.test",
    password: "senha-segura-456",
  });
  assert.equal(secondRegistration.status, 201);
  const secondProfile = await secondUser.get("/api/profile");
  assert.equal(secondProfile.body.profile.avatarData, null);
  const removedAvatar = await firstUser.patch("/api/profile").send({ avatarData: null });
  assert.equal(removedAvatar.body.profile.avatarData, null);
  const secondUsersActivities = await secondUser.get("/api/activities");
  assert.deepEqual(secondUsersActivities.body, []);
  const secondUsersFoods = await secondUser.get("/api/foods");
  assert.deepEqual(secondUsersFoods.body, []);
  const secondUsersWorkoutsBeforeCreate = await secondUser.get("/api/workouts");
  assert.deepEqual(secondUsersWorkoutsBeforeCreate.body, []);
  const secondPlan = await secondUser.post("/api/workouts").send({ name: "Treino privado" });
  assert.equal(secondPlan.status, 201);
  const crossAccountExercise = await secondUser.post(`/api/workouts/${secondPlan.body.id}/exercises`).send({
    exerciseId: privateExercise.body.id,
    sets: 3,
    reps: 10,
  });
  assert.equal(crossAccountExercise.status, 404);
  const crossAccountFood = await secondUser.post("/api/meals").send({
    name: "Tentativa de acesso",
    mealType: "outro",
    foodId: foodResponse.body.id,
  });
  assert.equal(crossAccountFood.status, 404);
  const crossAccountRead = await secondUser.patch(`/api/activities/${activityId}`).send({ durationMinutes: 50 });
  assert.equal(crossAccountRead.status, 404);
  const crossAccountWorkout = await secondUser.get("/api/workouts");
  assert.equal(crossAccountWorkout.body.length, 1);
  assert.equal(crossAccountWorkout.body[0].name, "Treino privado");

  const resetRequest = await firstUser.post("/api/auth/forgot-password").send({ email: "ana@example.test" });
  assert.equal(resetRequest.status, 200);
  assert.ok(resetRequest.body.resetToken);
  const resetResponse = await request(app).post("/api/auth/reset-password").send({
    token: resetRequest.body.resetToken,
    password: "nova-senha-segura-789",
  });
  assert.equal(resetResponse.status, 204);
  const invalidatedSession = await firstUser.get("/api/activities");
  assert.equal(invalidatedSession.status, 401);

  const newLogin = await request.agent(app).post("/api/auth/login").send({
    email: "ana@example.test",
    password: "nova-senha-segura-789",
  });
  assert.equal(newLogin.status, 200);

  for (let attempt = 0; attempt < 25; attempt++) {
    assert.equal((await request(app).post("/api/auth/login").send({})).status, 400);
  }
  const rateLimited = await request(app).post("/api/auth/login").send({});
  assert.equal(rateLimited.status, 429);
  assert.match(rateLimited.body.error, /Muitas tentativas de acesso/);

  await prisma.user.deleteMany();
  await prisma.exercise.deleteMany({ where: { createdById: { not: null } } });
  await prisma.exercise.delete({ where: { id: testExercise.id } });
});
