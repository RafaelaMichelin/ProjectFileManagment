import "./public/index.css";
import "./style.css";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";

function Root() {
	const [view, setView] = useState("login");
	const [usuario, setUsuario] = useState(null);

	const handleLoginSuccess = (dadosUsuario) => {
		setUsuario(dadosUsuario);
		setView("app");
	};

	const handleLogout = () => {
		setUsuario(null);
		setView("login");
	};

	return (
		<>
			{view === "app" ? (
				<App usuario={usuario} onLogout={handleLogout} />
			) : view === "register" ? (
				<Cadastro onRegistered={() => setView("login")} onCancel={() => setView("login")} />
			) : (
				<Login onLoginSuccess={handleLoginSuccess} onNavigate={setView} />
			)}
		</>
	);
}

ReactDOM.createRoot(document.getElementById("app")).render(<Root />);
