import { useTheme } from "../context/ThemeContext";

function IconProfile() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export default function Header({
  currentPage = "Início",
  onSelectPage = () => {},
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{currentPage}</h1>

      <div style={styles.iconArea}>
        <button
          onClick={() => onSelectPage("Início")}
          style={styles.iconButton}
          aria-label="Página inicial"
        >
          <IconHome />
        </button>
        <button
          onClick={toggleTheme}
          style={styles.iconButton}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <IconMoon /> : <IconSun />}
        </button>
        <button
          onClick={() => onSelectPage("Perfil")}
          style={styles.iconButton}
          aria-label="Perfil"
        >
          <IconProfile />
        </button>
        <button
          onClick={() => onSelectPage("Cadastro")}
          style={styles.iconButton}
          aria-label="Cadastro de usuário"
        >
          <IconLogout />
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottom: "1px solid var(--box-bg)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "22px",
    color: "var(--text)",
  },
  iconArea: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  iconButton: {
    width: "36px",
    height: "36px",
    padding: "6px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "10px",
    color: "var(--text)",
  },
};
