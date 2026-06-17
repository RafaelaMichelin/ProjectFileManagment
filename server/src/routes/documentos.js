import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/tipos", async (_req, res) => {
  try {
    const [tipos] = await pool.execute(
      "SELECT id_tipo_documento, nome_tipo, descricao FROM tipos_documento ORDER BY nome_tipo"
    );
    res.json(tipos);
  } catch (error) {
    console.error("Erro ao listar tipos de documento:", error);
    res.status(500).json({ error: "Erro ao buscar tipos de documento." });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [documentos] = await pool.execute(
      `SELECT d.id_documento, d.nome_arquivo, d.tipo_arquivo, d.validade, d.data_envio,
              d.id_protocolo, d.id_tipo_documento,
              p.codigo_protocolo, t.nome_tipo
       FROM documentos d
       INNER JOIN protocolos p ON p.id_protocolo = d.id_protocolo
       INNER JOIN tipos_documento t ON t.id_tipo_documento = d.id_tipo_documento
       ORDER BY d.data_envio DESC`
    );
    res.json(documentos);
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    res.status(500).json({ error: "Erro ao buscar documentos." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome_arquivo, tipo_arquivo, validade, id_protocolo, id_tipo_documento } = req.body;

    if (!nome_arquivo || !tipo_arquivo || !id_protocolo || !id_tipo_documento) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const [result] = await pool.execute(
      `INSERT INTO documentos (nome_arquivo, tipo_arquivo, validade, id_protocolo, id_tipo_documento)
       VALUES (?, ?, ?, ?, ?)`,
      [nome_arquivo, tipo_arquivo, validade || null, id_protocolo, id_tipo_documento]
    );

    res.status(201).json({
      message: "Documento registrado com sucesso.",
      documento: {
        id_documento: result.insertId,
        nome_arquivo,
        tipo_arquivo,
        validade: validade || null,
        id_protocolo,
        id_tipo_documento,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar documento:", error);
    res.status(500).json({ error: "Erro ao registrar documento." });
  }
});

export default router;
