import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { podeAcessarPagina } from "./utils/permissions";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Documentos from "./pages/Documentos";
import Protocolos from "./pages/Protocolos";
import Relatorios from "./pages/Relatorios";
import Logs from "./pages/Logs";
import Usuarios from "./pages/Usuarios";
import Perfil from "./pages/Perfil";
import { ThemeProvider } from "./context/ThemeContext";

export default function App({ usuario, onLogout, onUsuarioUpdate }) {
  const [selectedPage, setSelectedPage] = useState("Início");

  useEffect(() => {
    if (!podeAcessarPagina(usuario?.tipo_usuario, selectedPage)) {
      setSelectedPage("Início");
    }
  }, [usuario?.tipo_usuario, selectedPage]);

  const pages = {
    Início: <Dashboard />,
    Documentos: <Documentos usuario={usuario} />,
    Protocolos: <Protocolos usuario={usuario} />,
    Relatórios: <Relatorios />,
    Logs: <Logs />,
    Usuários: <Usuarios usuario={usuario} />,
    Perfil: <Perfil usuario={usuario} onUsuarioUpdate={onUsuarioUpdate} />,
  };

  return (
    <ThemeProvider>
      <div className="app-shell" style={styles.container}>
        <Sidebar
          selectedPage={selectedPage}
          onSelectPage={setSelectedPage}
          usuario={usuario}
        />

        <main className="app-main" style={styles.main}>
          <Header
            currentPage={selectedPage}
            usuario={usuario}
            onSelectPage={setSelectedPage}
            onLogout={onLogout}
          />
          <div className="app-content">{pages[selectedPage] || <Dashboard />}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "var(--app-bg)",
  },
  main: {
    flex: "1 1 0",
    minWidth: 0,
    padding: "18px 32px 36px",
    background: "var(--app-bg)",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};
