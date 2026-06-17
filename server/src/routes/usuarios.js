import { Router } from "express";
import pool from "../config/db.js";

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

export default router;
