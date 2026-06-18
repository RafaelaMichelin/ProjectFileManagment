import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { registrarLog } from "../services/logService.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [usuarios] = await pool.execute(
      `SELECT id_usuario, nome_completo, email, tipo_usuario, created_at
       FROM usuarios ORDER BY created_at DESC`
    );
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [usuarios] = await pool.execute(
      `SELECT id_usuario, nome_completo, email, tipo_usuario, created_at
       FROM usuarios WHERE id_usuario = ?`,
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome_completo, email, senha, tipo_usuario, id_usuario } = req.body;

    if (!nome_completo?.trim() || !email?.trim() || !senha || !tipo_usuario) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const [existentes] = await pool.execute(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (existentes.length > 0) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome_completo, email, senha, tipo_usuario)
       VALUES (?, ?, ?, ?)`,
      [nome_completo.trim(), email.trim().toLowerCase(), senhaHash, tipo_usuario]
    );

    await registrarLog(
      `Usuário criado pelo admin: ${email.trim().toLowerCase()}`,
      id_usuario || null
    );

    res.status(201).json({
      message: "Usuário criado com sucesso.",
      usuario: {
        id_usuario: result.insertId,
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nome_completo, email, senha, tipo_usuario, id_usuario } = req.body;
    const id = req.params.id;

    const [existentes] = await pool.execute(
      "SELECT id_usuario, email FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (existentes.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (email) {
      const [emailDuplicado] = await pool.execute(
        "SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?",
        [email.trim().toLowerCase(), id]
      );

      if (emailDuplicado.length > 0) {
        return res.status(409).json({ error: "Este e-mail já está em uso." });
      }
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      await pool.execute(
        `UPDATE usuarios SET nome_completo = ?, email = ?, senha = ?, tipo_usuario = ?
         WHERE id_usuario = ?`,
        [
          nome_completo?.trim() || existentes[0].nome_completo,
          email?.trim().toLowerCase() || existentes[0].email,
          senhaHash,
          tipo_usuario,
          id,
        ]
      );
    } else {
      await pool.execute(
        `UPDATE usuarios SET nome_completo = ?, email = ?, tipo_usuario = ?
         WHERE id_usuario = ?`,
        [
          nome_completo?.trim(),
          email?.trim().toLowerCase(),
          tipo_usuario,
          id,
        ]
      );
    }

    await registrarLog(
      `Usuário atualizado: ${email?.trim().toLowerCase() || existentes[0].email}`,
      id_usuario || null
    );

    res.json({ message: "Usuário atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id_usuario } = req.body;
    const id = req.params.id;

    const [usuarios] = await pool.execute(
      "SELECT email FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    await pool.execute("DELETE FROM usuarios WHERE id_usuario = ?", [id]);

    await registrarLog(`Usuário excluído: ${usuarios[0].email}`, id_usuario || null);

    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "Não é possível excluir usuário com protocolos ou registros vinculados.",
      });
    }
    res.status(500).json({ error: "Erro ao excluir usuário." });
  }
});

export default router;
