import { useTheme } from "../context/ThemeContext";

function SvgIcon({ children, size = 22 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function IconProfile() {
  return (
    <SvgIcon>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </SvgIcon>
  );
}

function IconLogout() {
  return (
    <SvgIcon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SvgIcon>
  );
}

function IconSun() {
  return (
    <SvgIcon size={20}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </SvgIcon>
  );
}

function IconMoon() {
  return (
    <SvgIcon size={20}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </SvgIcon>
  );
}

const subtitles = {
  Documentos: "Envie, acompanhe e corrija documentos do sistema.",
  Protocolos: "Acompanhe o andamento dos seus envios.",
  "RelatÃ³rios": "Analise os indicadores e registros do sistema.",
  Logs: "Acompanhamento das acoes realizadas pelos usuarios.",
  "UsuÃ¡rios": "Gerencie usuarios, operadores e administradores.",
  Perfil: "Gerencie suas informacoes pessoais e senha de acesso.",
};

export default function Header({
  currentPage = "InÃ­cio",
  usuario,
  onSelectPage = () => {},
  onLogout = () => {},
}) {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    const confirmed = window.confirm("Deseja sair?");
    if (confirmed) onLogout();
  };

  const isHome = currentPage === "InÃ­cio";
  const nome = usuario?.nome_completo?.split(" ")[0] || "Admin";

  return (
    <header className="app-header" style={styles.header}>
      <div>
        <h1 style={styles.title}>{isHome ? `Ola, ${nome}!` : currentPage}</h1>
        <p style={styles.subtitle}>
          {isHome
            ? "Bem-vindo ao sistema de gerenciamento de arquivos"
            : subtitles[currentPage] || "Gerencie as informacoes desta area."}
        </p>
      </div>

      <div className="app-header-actions" style={styles.iconArea}>
        <button onClick={toggleTheme} style={styles.iconButton} aria-label="Alternar tema">
          {theme === "light" ? <IconMoon /> : <IconSun />}
        </button>
        <button
          onClick={() => onSelectPage("Perfil")}
          style={styles.iconButton}
          aria-label="Perfil"
        >
          <IconProfile />
        </button>
        <button onClick={handleLogout} style={styles.iconButton} aria-label="Sair">
          <IconLogout />
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: "18px 0 28px",
    marginBottom: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.1,
    fontWeight: 800,
    color: "var(--text)",
  },
  subtitle: {
    margin: "10px 0 0",
    color: "var(--muted)",
    fontSize: 16,
  },
  iconArea: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },
  iconButton: {
    width: "54px",
    height: "54px",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "var(--box-bg)",
    border: "1px solid var(--line)",
    borderRadius: "12px",
    color: "var(--text)",
    boxShadow: "var(--shadow-soft)",
  },
};
