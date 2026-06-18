import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [registros] = await pool.execute(`
      SELECT p.codigo_protocolo AS codigo, t.nome_tipo AS tipo,
             u.nome_completo AS usuario, s.nome_status AS status,
             d.data_envio AS data
      FROM documentos d
      INNER JOIN protocolos p ON p.id_protocolo = d.id_protocolo
      INNER JOIN tipos_documento t ON t.id_tipo_documento = d.id_tipo_documento
      INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
      INNER JOIN status_protocolo s ON s.id_status = p.id_status
      ORDER BY d.data_envio DESC
    `);

    res.json(registros);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro ao buscar relatórios." });
  }
});

export default router;
