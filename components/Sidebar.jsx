import { getMenuItems } from "../utils/permissions";

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

function IconHome() {
  return (
    <SvgIcon>
      <path d="M3 12l9-8 9 8" />
      <path d="M5 10.5V20h5v-5h4v5h5v-9.5" />
    </SvgIcon>
  );
}

function IconFile() {
  return (
    <SvgIcon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </SvgIcon>
  );
}

function IconProtocolos() {
  return (
    <SvgIcon>
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </SvgIcon>
  );
}

function IconRelatorios() {
  return (
    <SvgIcon>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </SvgIcon>
  );
}

function IconUsuarios() {
  return (
    <SvgIcon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  );
}

function IconLogs() {
  return (
    <SvgIcon>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </SvgIcon>
  );
}

function IconProfile() {
  return (
    <SvgIcon size={24}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </SvgIcon>
  );
}

const ICONS = {
  "Inicio": <IconHome />,
  "InÃ­cio": <IconHome />,
  Documentos: <IconFile />,
  Protocolos: <IconProtocolos />,
  "RelatÃ³rios": <IconRelatorios />,
  Relatorios: <IconRelatorios />,
  "UsuÃ¡rios": <IconUsuarios />,
  Usuarios: <IconUsuarios />,
  Logs: <IconLogs />,
};

const MENU_META = {
  inicio: { icon: <IconHome />, color: "#0b73ff" },
  documentos: { icon: <IconFile />, color: "#2563eb" },
  protocolos: { icon: <IconProtocolos />, color: "#10b981" },
  relatorios: { icon: <IconRelatorios />, color: "#f59e0b" },
  usuarios: { icon: <IconUsuarios />, color: "#7c3aed" },
  logs: { icon: <IconLogs />, color: "#0ea5e9" },
};

function getMenuMeta(item) {
  const texto = item
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (texto.includes("cio") || texto.includes("inicio")) return MENU_META.inicio;
  if (texto.includes("document")) return MENU_META.documentos;
  if (texto.includes("protocolo")) return MENU_META.protocolos;
  if (texto.includes("relat")) return MENU_META.relatorios;
  if (texto.includes("usu")) return MENU_META.usuarios;
  if (texto.includes("log")) return MENU_META.logs;
  return MENU_META.documentos;
}

export default function Sidebar({ selectedPage, onSelectPage, usuario }) {
  const menuItems = getMenuItems(usuario?.tipo_usuario);
  const nome = usuario?.nome_completo?.split(" ")[0] || "Admin";
  const perfil = usuario?.tipo_usuario === "ADMIN" ? "Administrador" : usuario?.tipo_usuario || "Usuario";

  return (
    <aside className="app-sidebar" style={styles.sidebar}>
      <div className="app-sidebar-brand" style={styles.logo}>
        <img
          className="app-sidebar-logo"
          src="/fm-logo.png"
          alt="File Management"
          style={styles.logoImage}
        />
        <div style={styles.logoText}>File Management</div>
      </div>

      <nav className="app-sidebar-nav" style={styles.menuList} aria-label="Menu principal">
        {menuItems.map((item) => {
          const ativo = item === selectedPage;
          const meta = getMenuMeta(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectPage(item)}
              className="app-sidebar-item"
              style={ativo ? styles.menuItemActive : styles.menuItem}
            >
              <span style={{ ...styles.menuIcon, color: ativo ? "var(--primary)" : meta.color }}>
                {meta.icon}
              </span>
              <span>{item}</span>
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar-user" style={styles.userCard}>
        <div style={styles.avatarWrap}>
          <IconProfile />
          <span style={styles.onlineDot} />
        </div>
        <div style={styles.userText}>
          <strong style={styles.userName}>{nome}</strong>
          <span style={styles.userRole}>{perfil}</span>
        </div>
        <span style={styles.chevron}>⌄</span>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    flex: "0 0 256px",
    minHeight: "100vh",
    background: "var(--sidebar-bg)",
    borderRight: "1px solid var(--line)",
    padding: "28px 16px 20px",
    display: "flex",
    flexDirection: "column",
    color: "var(--text)",
    gap: "26px",
    position: "sticky",
    top: 0,
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  logoImage: {
    width: 86,
    height: 86,
    objectFit: "contain",
    filter: "drop-shadow(0 12px 20px rgba(11, 115, 255, 0.18))",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 800,
    color: "var(--primary)",
  },
  menuList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    margin: 0,
  },
  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 18px",
    border: "1px solid transparent",
    borderRadius: 12,
    background: "transparent",
    color: "var(--text)",
    fontWeight: 600,
    fontSize: 15,
    textAlign: "left",
  },
  menuItemActive: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 18px",
    border: "1px solid var(--line)",
    borderRadius: 12,
    background: "var(--nav-active-bg)",
    color: "var(--primary)",
    fontWeight: 700,
    fontSize: 15,
    textAlign: "left",
    boxShadow: "0 10px 24px rgba(23, 58, 105, 0.09)",
  },
  menuIcon: {
    width: 24,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    display: "none",
    marginTop: "auto",
    gridTemplateColumns: "42px 1fr auto",
    alignItems: "center",
    gap: 10,
    padding: "14px 12px",
    borderRadius: 12,
    background: "var(--user-card-bg)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow-soft)",
  },
  avatarWrap: {
    position: "relative",
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "var(--primary-soft)",
    color: "var(--text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#22c55e",
    border: "2px solid var(--box-bg)",
  },
  userText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  userName: {
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: {
    color: "var(--muted)",
    fontSize: 12,
  },
  chevron: {
    color: "var(--muted)",
    fontSize: 18,
  },
};
