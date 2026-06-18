const PAGINAS_POR_TIPO = {
  Início: ["ADMIN", "OPERADOR", "USUARIO"],
  Documentos: ["ADMIN", "OPERADOR", "USUARIO"],
  Protocolos: ["ADMIN", "OPERADOR", "USUARIO"],
  Relatórios: ["ADMIN", "OPERADOR"],
  Usuários: ["ADMIN"],
  Logs: ["ADMIN"],
  Perfil: ["ADMIN", "OPERADOR", "USUARIO"],
};

export function podeAcessarPagina(tipoUsuario, pagina) {
  const permitidos = PAGINAS_POR_TIPO[pagina];
  if (!permitidos) return false;
  return permitidos.includes(tipoUsuario);
}

export function getMenuItems(tipoUsuario) {
  return Object.keys(PAGINAS_POR_TIPO).filter(
    (pagina) => pagina !== "Perfil" && podeAcessarPagina(tipoUsuario, pagina)
  );
}
