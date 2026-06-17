import pool from "../config/db.js";

export async function registrarLog(acao, idUsuario = null) {
  await pool.execute(
    "INSERT INTO logs_sistema (acao, id_usuario) VALUES (?, ?)",
    [acao, idUsuario]
  );
}
