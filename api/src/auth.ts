import { createHash, randomBytes } from "node:crypto";
import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "./db.js";

const SESSION_COOKIE = "fittrack_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const passwordSchema = z.string().min(10).max(72).refine(
  (value) => Buffer.byteLength(value, "utf8") <= 72,
  "A senha deve ter no máximo 72 bytes.",
);

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
    maxAge: SESSION_DURATION_MS,
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string") {
    res.status(401).json({ error: "Autenticação necessária." });
    return;
  }
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, expiresAt: true },
  });
  if (!session || session.expiresAt <= new Date()) {
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "strict", path: "/api" });
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return;
  }
  req.userId = session.userId;
  next();
}

export const authRouter = Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Muitas tentativas de acesso. Aguarde o tempo indicado e tente novamente." });
  },
});

authRouter.post("/register", authRateLimit, async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254),
    password: passwordSchema,
  }).parse(req.body);
  const email = input.email.toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      profile: { create: {} },
    },
    select: { id: true, name: true, email: true, profile: true },
  });
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });
  setSessionCookie(res, token);
  res.status(201).json({ user });
});

authRouter.post("/login", authRateLimit, async (req, res) => {
  const input = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(72),
  }).parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true, email: true, name: true, passwordHash: true, profile: true },
  });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    res.status(401).json({ error: "E-mail ou senha inválidos." });
    return;
  }
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });
  setSessionCookie(res, token);
  res.json({ user: { id: user.id, name: user.name, email: user.email, profile: user.profile } });
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE] as string;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "strict", path: "/api" });
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
    },
  });
  if (!user) {
    res.status(401).json({ error: "Usuário não encontrado." });
    return;
  }
  res.json({ user });
});

authRouter.post("/forgot-password", authRateLimit, async (req, res) => {
  const { email } = z.object({ email: z.string().trim().email().max(254) }).parse(req.body);
  if (process.env.NODE_ENV === "production") {
    res.status(503).json({ error: "O envio de e-mail para recuperação ainda não está configurado." });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    res.json({ message: "Se a conta existir, será possível solicitar uma nova senha." });
    return;
  }
  const token = randomBytes(32).toString("hex");
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  res.json({
    message: "Token de recuperação local criado. Ele expira em 30 minutos.",
    resetToken: token,
  });
});

authRouter.post("/reset-password", authRateLimit, async (req, res) => {
  const input = z.object({
    token: z.string().min(32).max(128),
    password: passwordSchema,
  }).parse(req.body);
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });
  if (!reset || reset.expiresAt <= new Date()) {
    res.status(400).json({ error: "Token de recuperação inválido ou expirado." });
    return;
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
    prisma.passwordReset.deleteMany({ where: { userId: reset.userId } }),
  ]);
  res.status(204).end();
});
