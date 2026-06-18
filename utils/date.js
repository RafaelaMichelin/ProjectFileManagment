export function formatarData(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
}

export function formatarHora(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function classificarAcao(acao) {
  if (!acao) return "Outros";
  const texto = acao.toLowerCase();
  if (texto.includes("login")) return "Login";
  if (texto.includes("exclu")) return "Exclusão";
  if (texto.includes("atualiz") || texto.includes("moviment") || texto.includes("alter")) {
    return "Alteração";
  }
  if (
    texto.includes("criad") ||
    texto.includes("cadastr") ||
    texto.includes("enviad") ||
    texto.includes("registr")
  ) {
    return "Cadastro";
  }
  return "Outros";
}
