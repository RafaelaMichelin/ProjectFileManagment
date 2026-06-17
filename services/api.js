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

async function uploadRequest(path, formData, method = "POST") {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Erro no envio do arquivo.");
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

  getDashboard() {
    return request("/dashboard");
  },

  getUsuarios() {
    return request("/usuarios");
  },

  getUsuario(id) {
    return request(`/usuarios/${id}`);
  },

  createUsuario(dados) {
    return request("/usuarios", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  updateUsuario(id, dados) {
    return request(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  deleteUsuario(id, id_usuario) {
    return request(`/usuarios/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ id_usuario }),
    });
  },

  getProtocolos(idUsuario) {
    const query = idUsuario ? `?id_usuario=${idUsuario}` : "";
    return request(`/protocolos${query}`);
  },

  getProtocolo(id) {
    return request(`/protocolos/${id}`);
  },

  getDocumentosProtocolo(id) {
    return request(`/protocolos/${id}/documentos`);
  },

  getHistoricoProtocolo(id) {
    return request(`/protocolos/${id}/historico`);
  },

  getStatusProtocolo() {
    return request("/protocolos/status");
  },

  reenviarProtocolo(id, id_usuario) {
    return request(`/protocolos/${id}/reenviar`, {
      method: "PATCH",
      body: JSON.stringify({ id_usuario }),
    });
  },

  updateProtocolo(id, dados) {
    return request(`/protocolos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  movimentarProtocolo(id, dados) {
    return request(`/protocolos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(dados),
    });
  },

  deleteProtocolo(id, id_usuario) {
    return request(`/protocolos/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ id_usuario }),
    });
  },

  getDocumentos(idUsuario) {
    const query = idUsuario ? `?id_usuario=${idUsuario}` : "";
    return request(`/documentos${query}`);
  },

  getDocumento(id) {
    return request(`/documentos/${id}`);
  },

  getTiposDocumento() {
    return request("/documentos/tipos");
  },

  enviarDocumentos(formData) {
    return uploadRequest("/documentos/envio", formData);
  },

  urlArquivoDocumento(id) {
    return `${API_URL}/documentos/${id}/arquivo`;
  },

  createDocumento(dados) {
    return request("/documentos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  updateDocumento(id, formData) {
    return uploadRequest(`/documentos/${id}`, formData, "PUT");
  },

  deleteDocumento(id, id_usuario, tipo_usuario) {
    return request(`/documentos/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ id_usuario, tipo_usuario }),
    });
  },

  getLogs() {
    return request("/logs");
  },

  getLogsStats() {
    return request("/logs/stats");
  },

  getRelatorios() {
    return request("/relatorios");
  },
};
