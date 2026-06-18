import { Router } from "express";
import pool from "../config/db.js";
import { registrarLog } from "../services/logService.js";
import { obterIdStatus } from "../services/protocoloService.js";
import { removerArquivo } from "../config/upload.js";

const router = Router();

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

router.get("/", async (req, res) => {
  try {
    const { id_usuario } = req.query;
    let sql = `
      SELECT p.id_protocolo, p.codigo_protocolo, p.descricao, p.cpf_usuario,
             p.data_criacao, p.id_usuario, p.id_status,
             u.nome_completo AS nome_usuario, u.email AS email_usuario,
             s.nome_status,
             (SELECT COUNT(*) FROM documentos d WHERE d.id_protocolo = p.id_protocolo) AS qtd_documentos
      FROM protocolos p
      INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
      INNER JOIN status_protocolo s ON s.id_status = p.id_status
    `;
    const params = [];

    if (id_usuario) {
      sql += " WHERE p.id_usuario = ?";
      params.push(id_usuario);
    }

    sql += " ORDER BY p.data_criacao DESC";

    const [protocolos] = await pool.execute(sql, params);
    res.json(protocolos);
  } catch (error) {
    console.error("Erro ao listar protocolos:", error);
    res.status(500).json({ error: "Erro ao buscar protocolos." });
  }
});

router.get("/:id/historico", async (req, res) => {
  try {
    const [historico] = await pool.execute(
      `SELECT h.id_movimentacao, h.status_anterior, h.status_novo, h.descricao, h.data_hora,
              u.nome_completo AS nome_usuario
       FROM historico_movimentacao h
       INNER JOIN usuarios u ON u.id_usuario = h.id_usuario
       WHERE h.id_protocolo = ?
       ORDER BY h.data_hora DESC`,
      [req.params.id]
    );
    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de movimentação." });
  }
});

router.get("/:id/documentos", async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      `SELECT d.id_documento, d.nome_arquivo, d.caminho_arquivo, d.tipo_arquivo, d.validade, d.data_envio,
              d.id_tipo_documento, t.nome_tipo
       FROM documentos d
       INNER JOIN tipos_documento t ON t.id_tipo_documento = d.id_tipo_documento
       WHERE d.id_protocolo = ?
       ORDER BY d.data_envio`,
      [req.params.id]
    );
    res.json(documentos);
  } catch (error) {
    console.error("Erro ao buscar documentos do protocolo:", error);
    res.status(500).json({ error: "Erro ao buscar documentos do protocolo." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [protocolos] = await pool.execute(
      `SELECT p.id_protocolo, p.codigo_protocolo, p.descricao, p.cpf_usuario,
              p.data_criacao, p.id_usuario, p.id_status,
              u.nome_completo AS nome_usuario, u.email AS email_usuario,
              s.nome_status
       FROM protocolos p
       INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
       INNER JOIN status_protocolo s ON s.id_status = p.id_status
       WHERE p.id_protocolo = ?`,
      [req.params.id]
    );

    if (protocolos.length === 0) {
      return res.status(404).json({ error: "Protocolo não encontrado." });
    }

    const [documentos] = await pool.execute(
      `SELECT d.id_documento, d.nome_arquivo, d.caminho_arquivo, d.tipo_arquivo, d.validade, d.data_envio,
              d.id_tipo_documento, t.nome_tipo
       FROM documentos d
       INNER JOIN tipos_documento t ON t.id_tipo_documento = d.id_tipo_documento
       WHERE d.id_protocolo = ?
       ORDER BY d.data_envio`,
      [req.params.id]
    );

    res.json({ ...protocolos[0], documentos });
  } catch (error) {
    console.error("Erro ao buscar protocolo:", error);
    res.status(500).json({ error: "Erro ao buscar protocolo." });
  }
});

router.patch("/:id/reenviar", async (req, res) => {
  try {
    const { id_usuario } = req.body;
    const id = req.params.id;

    const [protocolos] = await pool.execute(
      `SELECT p.id_protocolo, p.codigo_protocolo, p.id_usuario, s.nome_status AS status_atual
       FROM protocolos p
       INNER JOIN status_protocolo s ON s.id_status = p.id_status
       WHERE p.id_protocolo = ?`,
      [id]
    );

    if (protocolos.length === 0) {
      return res.status(404).json({ error: "Protocolo não encontrado." });
    }

    const protocolo = protocolos[0];

    if (protocolo.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "Você só pode reenviar seus próprios protocolos." });
    }

    if (protocolo.status_atual !== "Pendente") {
      return res.status(400).json({
        error: "Só é possível reenviar protocolos com status Pendente.",
      });
    }

    const idStatusAnalise = await obterIdStatus(pool, "Em análise");
    if (!idStatusAnalise) {
      return res.status(500).json({ error: "Status 'Em análise' não configurado." });
    }

    await pool.execute("UPDATE protocolos SET id_status = ? WHERE id_protocolo = ?", [
      idStatusAnalise,
      id,
    ]);

    await pool.execute(
      `INSERT INTO historico_movimentacao (status_anterior, status_novo, id_protocolo, id_usuario)
       VALUES (?, ?, ?, ?)`,
      ["Pendente", "Em análise", id, id_usuario]
    );

    await registrarLog(
      `Protocolo reenviado após correção: ${protocolo.codigo_protocolo}`,
      id_usuario
    );

    res.json({
      message: "Protocolo reenviado para análise com sucesso.",
      status_novo: "Em análise",
    });
  } catch (error) {
    console.error("Erro ao reenviar protocolo:", error);
    res.status(500).json({ error: "Erro ao reenviar protocolo." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { descricao, cpf_usuario, id_usuario, tipo_usuario } = req.body;
    const id = req.params.id;

    const [existentes] = await pool.execute(
      `SELECT p.id_protocolo, p.codigo_protocolo, p.id_usuario, s.nome_status
       FROM protocolos p
       INNER JOIN status_protocolo s ON s.id_status = p.id_status
       WHERE p.id_protocolo = ?`,
      [id]
    );

    if (existentes.length === 0) {
      return res.status(404).json({ error: "Protocolo não encontrado." });
    }

    const isStaff = tipo_usuario === "ADMIN" || tipo_usuario === "OPERADOR";
    const protocolo = existentes[0];

    if (!isStaff) {
      if (protocolo.id_usuario !== id_usuario) {
        return res.status(403).json({ error: "Acesso negado." });
      }
      if (protocolo.nome_status !== "Pendente") {
        return res.status(403).json({
          error: "Só é possível editar protocolos com status Pendente.",
        });
      }
    }

    await pool.execute(
      `UPDATE protocolos SET descricao = ?, cpf_usuario = ? WHERE id_protocolo = ?`,
      [descricao || null, cpf_usuario || null, id]
    );

    await registrarLog(
      `Protocolo atualizado: ${protocolo.codigo_protocolo}`,
      id_usuario || null
    );

    res.json({ message: "Protocolo atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar protocolo:", error);
    res.status(500).json({ error: "Erro ao atualizar protocolo." });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { id_status, id_usuario, descricao } = req.body;
    const id = req.params.id;

    if (!id_status || !id_usuario) {
      return res.status(400).json({ error: "Status e usuário operador são obrigatórios." });
    }

    const descricaoMovimentacao = descricao?.trim() || null;

    const [protocolos] = await pool.execute(
      `SELECT p.id_protocolo, p.codigo_protocolo, s.nome_status AS status_atual
       FROM protocolos p
       INNER JOIN status_protocolo s ON s.id_status = p.id_status
       WHERE p.id_protocolo = ?`,
      [id]
    );

    if (protocolos.length === 0) {
      return res.status(404).json({ error: "Protocolo não encontrado." });
    }

    const [novoStatus] = await pool.execute(
      "SELECT nome_status FROM status_protocolo WHERE id_status = ?",
      [id_status]
    );

    if (novoStatus.length === 0) {
      return res.status(400).json({ error: "Status inválido." });
    }

    const statusAnterior = protocolos[0].status_atual;
    const statusNovo = novoStatus[0].nome_status;

    await pool.execute("UPDATE protocolos SET id_status = ? WHERE id_protocolo = ?", [
      id_status,
      id,
    ]);

    await pool.execute(
      `INSERT INTO historico_movimentacao (status_anterior, status_novo, descricao, id_protocolo, id_usuario)
       VALUES (?, ?, ?, ?, ?)`,
      [statusAnterior, statusNovo, descricaoMovimentacao, id, id_usuario]
    );

    const logDescricao = descricaoMovimentacao ? ` — Obs: ${descricaoMovimentacao}` : "";
    await registrarLog(
      `Protocolo movimentado (${protocolos[0].codigo_protocolo}): ${statusAnterior} → ${statusNovo}${logDescricao}`,
      id_usuario
    );

    res.json({
      message: "Protocolo movimentado com sucesso.",
      status_anterior: statusAnterior,
      status_novo: statusNovo,
    });
  } catch (error) {
    console.error("Erro ao movimentar protocolo:", error);
    res.status(500).json({ error: "Erro ao movimentar protocolo." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id_usuario } = req.body;
    const id = req.params.id;

    const [protocolos] = await pool.execute(
      "SELECT codigo_protocolo FROM protocolos WHERE id_protocolo = ?",
      [id]
    );

    if (protocolos.length === 0) {
      return res.status(404).json({ error: "Protocolo não encontrado." });
    }

    const [docs] = await pool.execute(
      "SELECT caminho_arquivo FROM documentos WHERE id_protocolo = ?",
      [id]
    );
    docs.forEach((d) => removerArquivo(d.caminho_arquivo));

    await pool.execute("DELETE FROM historico_movimentacao WHERE id_protocolo = ?", [id]);
    await pool.execute("DELETE FROM documentos WHERE id_protocolo = ?", [id]);
    await pool.execute("DELETE FROM protocolos WHERE id_protocolo = ?", [id]);

    await registrarLog(
      `Protocolo excluído: ${protocolos[0].codigo_protocolo}`,
      id_usuario || null
    );

    res.json({ message: "Protocolo excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir protocolo:", error);
    res.status(500).json({ error: "Erro ao excluir protocolo." });
  }
});

export default router;
