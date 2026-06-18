import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [[totais]] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM documentos) AS total_documentos,
        (SELECT COUNT(*) FROM protocolos) AS total_protocolos,
        (SELECT COUNT(*) FROM protocolos p
         INNER JOIN status_protocolo s ON s.id_status = p.id_status
         WHERE s.nome_status IN ('Pendente', 'Recebido')) AS total_pendentes,
        (SELECT COUNT(*) FROM protocolos p
         INNER JOIN status_protocolo s ON s.id_status = p.id_status
         WHERE s.nome_status = 'Finalizado') AS total_finalizados
    `);

    const [documentosPorTipo] = await pool.execute(`
      SELECT t.nome_tipo AS tipo, COUNT(d.id_documento) AS quantidade
      FROM tipos_documento t
      LEFT JOIN documentos d ON d.id_tipo_documento = t.id_tipo_documento
      GROUP BY t.id_tipo_documento, t.nome_tipo
      ORDER BY quantidade DESC
    `);

    const [protocolosPorStatus] = await pool.execute(`
      SELECT s.nome_status AS name, COUNT(p.id_protocolo) AS value
      FROM status_protocolo s
      LEFT JOIN protocolos p ON p.id_status = s.id_status
      GROUP BY s.id_status, s.nome_status
      ORDER BY s.id_status
    `);

    const [ultimosProtocolos] = await pool.execute(`
      SELECT p.codigo_protocolo, u.nome_completo AS usuario,
             s.nome_status AS status, p.data_criacao AS data
      FROM protocolos p
      INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
      INNER JOIN status_protocolo s ON s.id_status = p.id_status
      ORDER BY p.data_criacao DESC
      LIMIT 5
    `);

    res.json({
      cards: {
        documentos: totais.total_documentos,
        protocolos: totais.total_protocolos,
        pendentes: totais.total_pendentes,
        finalizados: totais.total_finalizados,
      },
      documentosPorTipo,
      protocolosPorStatus,
      ultimosProtocolos,
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    res.status(500).json({ error: "Erro ao buscar dados do dashboard." });
  }
});

export default router;
