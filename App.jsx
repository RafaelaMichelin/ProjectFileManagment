import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Documentos from "./pages/Documentos";
import Protocolos from "./pages/Protocolos";
import Relatorios from "./pages/Relatorios";
import Logs from "./pages/Logs";
import Usuarios from "./pages/Usuarios";
import Perfil from "./pages/Perfil";
import { ThemeProvider } from "./context/ThemeContext";

export default function App({ onLogout }) {
  const [selectedPage, setSelectedPage] = useState("Início");

  const pages = {
    Início: <Dashboard />,
    Documentos: <Documentos />,
    Protocolos: <Protocolos />,
    Relatórios: <Relatorios />,
    Logs: <Logs />,
    Usuários: <Usuarios />,
    Perfil: <Perfil />,
  };

  const hideSidebar = selectedPage === "Perfil";

  return (
    <ThemeProvider>
      <div style={styles.container}>
        {!hideSidebar && (
          <Sidebar selectedPage={selectedPage} onSelectPage={setSelectedPage} />
        )}

        <main style={styles.main}>
          <Header
            currentPage={selectedPage}
            onSelectPage={setSelectedPage}
            onLogout={onLogout}
          />
          {pages[selectedPage] || <Dashboard />}
        </main>
      </div>
    </ThemeProvider>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    minHeight: "100vh",
    width: "100%",
    background: "var(--bg)",
  },
  main: {
    flex: "1 1 0",
    minWidth: 0,
    padding: "28px",
    background: "var(--bg)",
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
  },
};
