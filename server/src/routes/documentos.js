import { Router } from "express";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";
import { registrarLog } from "../services/logService.js";
import {
  gerarCodigoProtocolo,
  obterIdStatus,
  protocoloPermiteEdicaoUsuario,
} from "../services/protocoloService.js";
import {
  uploadMultiplos,
  uploadUnico,
  extensaoParaTipo,
  removerArquivo,
  UPLOAD_DIR,
} from "../config/upload.js";

const router = Router();

function limparArquivos(arquivos) {
  (arquivos || []).forEach((f) => removerArquivo(f.filename));
}

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

router.get("/", async (req, res) => {
  try {
    const { id_usuario } = req.query;
    let sql = `
      SELECT d.id_documento, d.nome_arquivo, d.caminho_arquivo, d.tipo_arquivo,
             d.validade, d.data_envio, d.id_protocolo, d.id_tipo_documento,
             p.codigo_protocolo, p.id_usuario,
             t.nome_tipo, s.nome_status AS status_protocolo
      FROM documentos d
      INNER JOIN protocolos p ON p.id_protocolo = d.id_protocolo
      INNER JOIN status_protocolo s ON s.id_status = p.id_status
      INNER JOIN tipos_documento t ON t.id_tipo_documento = d.id_tipo_documento
    `;
    const params = [];

    if (id_usuario) {
      sql += " WHERE p.id_usuario = ?";
      params.push(id_usuario);
    }

    sql += " ORDER BY d.data_envio DESC";

    const [documentos] = await pool.execute(sql, params);
    res.json(documentos);
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    res.status(500).json({ error: "Erro ao buscar documentos." });
  }
});

router.post("/envio", uploadMultiplos.array("arquivos", 20), async (req, res) => {
  const connection = await pool.getConnection();
  const arquivos = req.files || [];

  try {
    const id_usuario = Number(req.body.id_usuario);
    const cpf_usuario = req.body.cpf_usuario || null;
    const descricao = req.body.descricao || null;

    let metadados = [];
    try {
      metadados = JSON.parse(req.body.metadados || "[]");
    } catch {
      limparArquivos(arquivos);
      return res.status(400).json({ error: "Metadados dos documentos inválidos." });
    }

    if (!id_usuario) {
      limparArquivos(arquivos);
      return res.status(400).json({ error: "Usuário é obrigatório." });
    }

    if (!Array.isArray(metadados) || metadados.length === 0) {
      limparArquivos(arquivos);
      return res.status(400).json({ error: "Envie pelo menos um documento." });
    }

    if (arquivos.length !== metadados.length) {
      limparArquivos(arquivos);
      return res.status(400).json({
        error: "Selecione um arquivo para cada documento informado.",
      });
    }

    for (let i = 0; i < metadados.length; i++) {
      if (!metadados[i].id_tipo_documento) {
        limparArquivos(arquivos);
        return res.status(400).json({ error: "Informe o tipo de cada documento." });
      }
    }

    const idStatusRecebido = await obterIdStatus(connection, "Recebido");
    if (!idStatusRecebido) {
      limparArquivos(arquivos);
      return res.status(500).json({ error: "Status 'Recebido' não configurado." });
    }

    const codigo_protocolo = gerarCodigoProtocolo();

    await connection.beginTransaction();

    const [resultProtocolo] = await connection.execute(
      `INSERT INTO protocolos (codigo_protocolo, descricao, cpf_usuario, id_usuario, id_status)
       VALUES (?, ?, ?, ?, ?)`,
      [codigo_protocolo, descricao, cpf_usuario, id_usuario, idStatusRecebido]
    );

    const id_protocolo = resultProtocolo.insertId;
    const documentosInseridos = [];

    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];
      const meta = metadados[i];
      const tipo_arquivo = extensaoParaTipo(path.extname(arquivo.originalname));

      if (!tipo_arquivo) {
        throw new Error("Formato de arquivo não suportado.");
      }

      const [resultDoc] = await connection.execute(
        `INSERT INTO documentos (nome_arquivo, caminho_arquivo, tipo_arquivo, validade, id_protocolo, id_tipo_documento)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          arquivo.originalname,
          arquivo.filename,
          tipo_arquivo,
          meta.validade || null,
          id_protocolo,
          meta.id_tipo_documento,
        ]
      );

      documentosInseridos.push({
        id_documento: resultDoc.insertId,
        nome_arquivo: arquivo.originalname,
        caminho_arquivo: arquivo.filename,
        tipo_arquivo,
        validade: meta.validade || null,
        id_protocolo,
        id_tipo_documento: meta.id_tipo_documento,
      });
    }

    await connection.execute(
      `INSERT INTO historico_movimentacao (status_anterior, status_novo, id_protocolo, id_usuario)
       VALUES (?, ?, ?, ?)`,
      [null, "Recebido", id_protocolo, id_usuario]
    );

    await connection.commit();

    await registrarLog(
      `Envio de documentos — protocolo gerado: ${codigo_protocolo} (${arquivos.length} arquivo(s))`,
      id_usuario
    );

    res.status(201).json({
      message: "Documentos enviados e protocolo gerado com sucesso.",
      protocolo: {
        id_protocolo,
        codigo_protocolo,
        descricao,
        cpf_usuario,
        id_usuario,
        id_status: idStatusRecebido,
        nome_status: "Recebido",
      },
      documentos: documentosInseridos,
    });
  } catch (error) {
    await connection.rollback();
    limparArquivos(arquivos);
    console.error("Erro no envio de documentos:", error);
    res.status(500).json({
      error: error.message || "Erro ao enviar documentos e gerar protocolo.",
    });
  } finally {
    connection.release();
  }
});

router.get("/:id/arquivo", async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      "SELECT nome_arquivo, caminho_arquivo, tipo_arquivo FROM documentos WHERE id_documento = ?",
      [req.params.id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: "Documento não encontrado." });
    }

    const doc = documentos[0];

    if (!doc.caminho_arquivo) {
      return res.status(404).json({ error: "Arquivo não disponível para download." });
    }

    const caminho = path.join(UPLOAD_DIR, doc.caminho_arquivo);

    if (!fs.existsSync(caminho)) {
      return res.status(404).json({ error: "Arquivo não encontrado no servidor." });
    }

    const mime = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      png: "image/png",
    };

    res.setHeader("Content-Type", mime[doc.tipo_arquivo] || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.nome_arquivo)}"`
    );
    res.sendFile(caminho);
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    res.status(500).json({ error: "Erro ao baixar arquivo." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      `SELECT d.id_documento, d.nome_arquivo, d.caminho_arquivo, d.tipo_arquivo,
              d.validade, d.data_envio, d.id_protocolo, d.id_tipo_documento,
              p.codigo_protocolo, p.id_usuario, s.nome_status AS status_protocolo,
              t.nome_tipo
       FROM documentos d
       INNER JOIN protocolos p ON p.id_protocolo = d.id_protocolo
       INNER JOIN status_protocolo s ON s.id_status = p.id_status
       INNER JOIN tipos_documento t ON t.id_tipo_documento = d.id_tipo_documento
       WHERE d.id_documento = ?`,
      [req.params.id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: "Documento não encontrado." });
    }

    res.json(documentos[0]);
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    res.status(500).json({ error: "Erro ao buscar documento." });
  }
});

router.put("/:id", uploadUnico.single("arquivo"), async (req, res) => {
  try {
    const id = req.params.id;
    const id_usuario = Number(req.body.id_usuario);
    const tipo_usuario = req.body.tipo_usuario;
    const validade = req.body.validade || null;
    const id_tipo_documento = Number(req.body.id_tipo_documento);
    const arquivo = req.file;

    const [existentes] = await pool.execute(
      `SELECT d.nome_arquivo, d.caminho_arquivo, d.tipo_arquivo, d.id_protocolo
       FROM documentos d WHERE d.id_documento = ?`,
      [id]
    );

    if (existentes.length === 0) {
      if (arquivo) removerArquivo(arquivo.filename);
      return res.status(404).json({ error: "Documento não encontrado." });
    }

    const docAtual = existentes[0];
    const isStaff = tipo_usuario === "ADMIN" || tipo_usuario === "OPERADOR";

    if (!isStaff) {
      const permissao = await protocoloPermiteEdicaoUsuario(
        pool,
        docAtual.id_protocolo,
        id_usuario
      );
      if (!permissao.ok) {
        if (arquivo) removerArquivo(arquivo.filename);
        return res.status(403).json({ error: permissao.erro });
      }
    }

    let nome_arquivo = docAtual.nome_arquivo;
    let caminho_arquivo = docAtual.caminho_arquivo;
    let tipo_arquivo = docAtual.tipo_arquivo;

    if (arquivo) {
      const novoTipo = extensaoParaTipo(path.extname(arquivo.originalname));
      if (!novoTipo) {
        removerArquivo(arquivo.filename);
        return res.status(400).json({ error: "Formato de arquivo não suportado." });
      }
      removerArquivo(docAtual.caminho_arquivo);
      nome_arquivo = arquivo.originalname;
      caminho_arquivo = arquivo.filename;
      tipo_arquivo = novoTipo;
    }

    await pool.execute(
      `UPDATE documentos
       SET nome_arquivo = ?, caminho_arquivo = ?, tipo_arquivo = ?, validade = ?, id_tipo_documento = ?
       WHERE id_documento = ?`,
      [nome_arquivo, caminho_arquivo, tipo_arquivo, validade, id_tipo_documento, id]
    );

    await registrarLog(`Documento corrigido: ${nome_arquivo}`, id_usuario || null);

    res.json({ message: "Documento atualizado com sucesso." });
  } catch (error) {
    if (req.file) removerArquivo(req.file.filename);
    console.error("Erro ao atualizar documento:", error);
    res.status(500).json({ error: "Erro ao atualizar documento." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id_usuario, tipo_usuario } = req.body;
    const id = req.params.id;

    const [documentos] = await pool.execute(
      `SELECT d.nome_arquivo, d.caminho_arquivo, d.id_protocolo
       FROM documentos d WHERE d.id_documento = ?`,
      [id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: "Documento não encontrado." });
    }

    const isStaff = tipo_usuario === "ADMIN" || tipo_usuario === "OPERADOR";
    if (!isStaff) {
      const permissao = await protocoloPermiteEdicaoUsuario(
        pool,
        documentos[0].id_protocolo,
        id_usuario
      );
      if (!permissao.ok) {
        return res.status(403).json({ error: permissao.erro });
      }
    }

    removerArquivo(documentos[0].caminho_arquivo);
    await pool.execute("DELETE FROM documentos WHERE id_documento = ?", [id]);

    await registrarLog(
      `Documento excluído: ${documentos[0].nome_arquivo}`,
      id_usuario || null
    );

    res.json({ message: "Documento excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    res.status(500).json({ error: "Erro ao excluir documento." });
  }
});

export default router;
