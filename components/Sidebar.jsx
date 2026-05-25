function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12L12 4l9 8" />
      <path d="M6 12v8h5v-5h2v5h5v-8" />
      <path d="M9 21h6" />
    </svg>
  );
}

export default function Sidebar({ selectedPage, onSelectPage }) {
  const menuItems = [
    "Início",
    "Documentos",
    "Protocolos",
    "Relatórios",
    "Usuários",
    "Logs",
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <IconHome />
        </div>
        <div style={styles.logoText}>File Managment</div>
      </div>

      <ul style={styles.menuList}>
        {menuItems.map((item) => (
          <li
            key={item}
            onClick={() => onSelectPage(item)}
            style={
              item === selectedPage ? styles.menuItemActive : styles.menuItem
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

const styles = {
  sidebar: {
    flex: "0 0 240px",
    minWidth: "220px",
    width: "100%",
    maxWidth: "260px",
    background: "var(--sidebar-bg)",
    padding: "28px 18px",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
    gap: "20px",
  },
  logo: {
    textAlign: "center",
    marginBottom: 20,
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    color: "#ffffff",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff9ab",
  },
  menuList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  menuItem: {
    padding: "12px 14px",
    cursor: "pointer",
    color: "#fff9c7",
    marginBottom: 10,
    borderRadius: 12,
    transition: "background 0.2s",
  },
  menuItemActive: {
    padding: "12px 14px",
    cursor: "pointer",
    color: "#fff",
    background: "rgba(255,255,255,0.35)",
    borderRadius: 12,
    marginBottom: 10,
  },
};
