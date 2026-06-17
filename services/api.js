const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Erro na requisição.");
  }

  return data;
}

export const api = {
  login(email, senha) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  },

  register({ nome_completo, email, senha, confirmar_senha }) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nome_completo, email, senha, confirmar_senha }),
    });
  },

  getUsuarios() {
    return request("/usuarios");
  },

  getProtocolos() {
    return request("/protocolos");
  },

  getStatusProtocolo() {
    return request("/protocolos/status");
  },

  getDocumentos() {
    return request("/documentos");
  },

  getTiposDocumento() {
    return request("/documentos/tipos");
  },

  getLogs() {
    return request("/logs");
  },
};
