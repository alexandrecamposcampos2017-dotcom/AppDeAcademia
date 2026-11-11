import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { ZodError } from "zod";
import { authRouter } from "./auth.js";
import { fitnessRouter } from "./fitness.js";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin && origin !== webOrigin) {
      res.status(403).json({ error: "Origem da requisição não autorizada." });
      return;
    }
  }
  next();
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api", fitnessRouter);

app.use((_req, res) => res.status(404).json({ error: "Recurso não encontrado." }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: error.issues[0]?.message ?? "Dados inválidos.", details: error.issues });
    return;
  }
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
    res.status(409).json({ error: "Já existe um registro com esses dados." });
    return;
  }
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") {
    res.status(400).json({ error: "Um dos registros relacionados não existe." });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Erro interno ao processar a solicitação." });
});
