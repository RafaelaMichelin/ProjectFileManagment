import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { registrarLog } from "../services/logService.js";

const router = Router();

async function verificarSenha(senhaInformada, senhaArmazenada) {
  const hashValido = await bcrypt.compare(senhaInformada, senhaArmazenada).catch(() => false);
  if (hashValido) return true;

  if (senhaInformada === senhaArmazenada) return "legacy";
  return false;
}

router.post("/register", async (req, res) => {
  try {
    const { nome_completo, email, senha, confirmar_senha } = req.body;

    if (!nome_completo?.trim() || !email?.trim() || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    if (senha !== confirmar_senha) {
      return res.status(400).json({ error: "As senhas não coincidem." });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
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
       VALUES (?, ?, ?, 'USUARIO')`,
      [nome_completo.trim(), email.trim().toLowerCase(), senhaHash]
    );

    await registrarLog(`Usuário cadastrado: ${email.trim().toLowerCase()}`, result.insertId);

    res.status(201).json({
      message: "Cadastro realizado com sucesso.",
      usuario: {
        id_usuario: result.insertId,
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        tipo_usuario: "USUARIO",
      },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar usuário." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email?.trim() || !senha) {
      return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const [usuarios] = await pool.execute(
      `SELECT id_usuario, nome_completo, email, senha, tipo_usuario, created_at
       FROM usuarios WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const usuario = usuarios[0];
    const senhaOk = await verificarSenha(senha, usuario.senha);

    if (!senhaOk) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    if (senhaOk === "legacy") {
      const novoHash = await bcrypt.hash(senha, 10);
      await pool.execute("UPDATE usuarios SET senha = ? WHERE id_usuario = ?", [
        novoHash,
        usuario.id_usuario,
      ]);
    }

    await registrarLog(`Login realizado: ${usuario.email}`, usuario.id_usuario);

    res.json({
      message: "Login realizado com sucesso.",
      usuario: {
        id_usuario: usuario.id_usuario,
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        created_at: usuario.created_at,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno ao realizar login." });
  }
});

export default router;
