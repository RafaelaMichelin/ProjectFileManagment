import { Router } from "express";
import pool from "../config/db.js";
import { registrarLog } from "../services/logService.js";

const router = Router();

function gerarCodigoProtocolo() {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sufixo = Math.floor(Math.random() * 900 + 100);
  return `PROT-${data}-${sufixo}`;
}

router.get("/status", async (_req, res) => {
  try {
    const [status] = await pool.execute(
      "SELECT id_status, nome_status, descricao FROM status_protocolo ORDER BY id_status"
    );
    res.json(status);
  } catch (error) {
    console.error("Erro ao listar status:", error);
    res.status(500).json({ error: "Erro ao buscar status de protocolo." });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [protocolos] = await pool.execute(
      `SELECT p.id_protocolo, p.codigo_protocolo, p.descricao, p.cpf_usuario,
              p.data_criacao, p.id_usuario, p.id_status,
              u.nome_completo AS nome_usuario, u.email AS email_usuario,
              s.nome_status
       FROM protocolos p
       INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
       INNER JOIN status_protocolo s ON s.id_status = p.id_status
       ORDER BY p.data_criacao DESC`
    );
    res.json(protocolos);
  } catch (error) {
    console.error("Erro ao listar protocolos:", error);
    res.status(500).json({ error: "Erro ao buscar protocolos." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { descricao, cpf_usuario, id_usuario, id_status } = req.body;

    if (!id_usuario || !id_status) {
      return res.status(400).json({ error: "Usuário e status são obrigatórios." });
    }

    const codigo_protocolo = gerarCodigoProtocolo();

    const [result] = await pool.execute(
      `INSERT INTO protocolos (codigo_protocolo, descricao, cpf_usuario, id_usuario, id_status)
       VALUES (?, ?, ?, ?, ?)`,
      [codigo_protocolo, descricao || null, cpf_usuario || null, id_usuario, id_status]
    );

    const [statusRows] = await pool.execute(
      "SELECT nome_status FROM status_protocolo WHERE id_status = ?",
      [id_status]
    );

    await pool.execute(
      `INSERT INTO historico_movimentacao (status_anterior, status_novo, id_protocolo, id_usuario)
       VALUES (?, ?, ?, ?)`,
      [null, statusRows[0]?.nome_status || "Recebido", result.insertId, id_usuario]
    );

    await registrarLog(`Protocolo criado: ${codigo_protocolo}`, id_usuario);

    res.status(201).json({
      message: "Protocolo criado com sucesso.",
      protocolo: {
        id_protocolo: result.insertId,
        codigo_protocolo,
        descricao: descricao || null,
        cpf_usuario: cpf_usuario || null,
        id_usuario,
        id_status,
      },
    });
  } catch (error) {
    console.error("Erro ao criar protocolo:", error);
    res.status(500).json({ error: "Erro ao criar protocolo." });
  }
});

export default router;
