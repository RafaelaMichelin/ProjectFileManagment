import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import protocolosRoutes from "./routes/protocolos.js";
import documentosRoutes from "./routes/documentos.js";
import logsRoutes from "./routes/logs.js";

dotenv.config();

const app = express();
const PORT = 59284;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Falha na conexão com o banco:", error.message);
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/protocolos", protocolosRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/logs", logsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
