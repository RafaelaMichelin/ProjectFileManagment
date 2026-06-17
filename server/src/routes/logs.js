import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [usuarios] = await pool.execute(
      `SELECT DISTINCT u.nome_completo
       FROM logs_sistema l
       INNER JOIN usuarios u ON u.id_usuario = l.id_usuario
       ORDER BY u.nome_completo`
    );

    const [porDia] = await pool.execute(`
      SELECT DATE(data_log) AS dia, COUNT(*) AS eventos
      FROM logs_sistema
      WHERE data_log >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(data_log)
      ORDER BY dia
    `);

    res.json({
      usuarios: usuarios.map((u) => u.nome_completo),
      porDia,
    });
  } catch (error) {
    console.error("Erro ao buscar stats de logs:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas de logs." });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [logs] = await pool.execute(
      `SELECT l.id_log, l.acao, l.data_log, l.id_usuario,
              u.nome_completo AS nome_usuario, u.email AS email_usuario
       FROM logs_sistema l
       LEFT JOIN usuarios u ON u.id_usuario = l.id_usuario
       ORDER BY l.data_log DESC
       LIMIT 500`
    );
    res.json(logs);
  } catch (error) {
    console.error("Erro ao listar logs:", error);
    res.status(500).json({ error: "Erro ao buscar logs." });
  }
});

export default router;
