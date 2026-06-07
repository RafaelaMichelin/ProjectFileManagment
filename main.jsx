import "./public/index.css";
import "./style.css";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";

function Root() {
	const [view, setView] = useState("login"); // 'login' | 'register' | 'app'

	const handleLoginSuccess = () => setView("app");

	return (
		<>
			{view === "app" ? (
				<App />
			) : view === "register" ? (
				<Cadastro onRegistered={() => setView("login")} onCancel={() => setView("login")} />
			) : (
				<Login onLoginSuccess={handleLoginSuccess} onNavigate={setView} />
			)}
		</>
	);
}

ReactDOM.createRoot(document.getElementById("app")).render(<Root />);
