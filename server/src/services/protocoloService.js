export function gerarCodigoProtocolo() {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sufixo = Math.floor(Math.random() * 900 + 100);
  return `PROT-${data}-${sufixo}`;
}

export async function obterIdStatus(pool, nomeStatus) {
  const [rows] = await pool.execute(
    "SELECT id_status FROM status_protocolo WHERE nome_status = ?",
    [nomeStatus]
  );
  return rows[0]?.id_status || null;
}

export async function protocoloPermiteEdicaoUsuario(pool, idProtocolo, idUsuario) {
  const [rows] = await pool.execute(
    `SELECT p.id_usuario, s.nome_status
     FROM protocolos p
     INNER JOIN status_protocolo s ON s.id_status = p.id_status
     WHERE p.id_protocolo = ?`,
    [idProtocolo]
  );

  if (rows.length === 0) return { ok: false, erro: "Protocolo não encontrado." };

  const protocolo = rows[0];
  if (protocolo.id_usuario !== idUsuario) {
    return { ok: false, erro: "Você só pode alterar seus próprios protocolos." };
  }
  if (protocolo.nome_status !== "Pendente") {
    return {
      ok: false,
      erro: "Só é possível alterar documentos quando o protocolo está Pendente.",
    };
  }

  return { ok: true, protocolo };
}
