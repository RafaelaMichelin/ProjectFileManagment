import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [logs] = await pool.execute(
      `SELECT l.id_log, l.acao, l.data_log, l.id_usuario,
              u.nome_completo AS nome_usuario, u.email AS email_usuario
       FROM logs_sistema l
       LEFT JOIN usuarios u ON u.id_usuario = l.id_usuario
       ORDER BY l.data_log DESC
       LIMIT 200`
    );
    res.json(logs);
  } catch (error) {
    console.error("Erro ao listar logs:", error);
    res.status(500).json({ error: "Erro ao buscar logs." });
  }
});

export default router;
