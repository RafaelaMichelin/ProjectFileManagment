import { useState } from "react";
import { api } from "../services/api";

export default function Cadastro({ onRegistered, onCancel }) {
  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    senha: "",
    confirmar_senha: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      await api.register(form);
      setSucesso("Cadastro realizado! Redirecionando para o login...");
      setTimeout(() => {
        if (onRegistered) onRegistered();
      }, 1200);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section style={styles.container}>
      <div style={styles.arcTop} />
      <div style={styles.arcBottom} />
      <div style={styles.box}>
        <img src="/fm-logo.png" alt="File Management" style={styles.logoImage} />
        <h2 style={styles.title}>File Management</h2>
        <p style={styles.subtitle}>Crie sua conta para continuar</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>
            <input
              placeholder="Nome Completo"
              style={styles.input}
              type="text"
              name="nome_completo"
              value={form.nome_completo}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <input
              placeholder="Email"
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <input
              placeholder="Senha"
              style={styles.input}
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>
          <label>
            <input
              placeholder="Confirmar Senha"
              style={styles.input}
              type="password"
              name="confirmar_senha"
              value={form.confirmar_senha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          {erro && <p style={styles.erro}>{erro}</p>}
          {sucesso && <p style={styles.sucesso}>{sucesso}</p>}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.primary} disabled={carregando}>
              {carregando ? "Salvando..." : "Cadastrar"}
            </button>
            <button
              style={styles.secundary}
              type="button"
              onClick={() => onCancel && onCancel()}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%)",
    padding: "24px",
  },
  arcTop: {
    position: "absolute",
    top: -180,
    right: -130,
    width: 440,
    height: 440,
    borderRadius: "50%",
    background: "rgba(78, 151, 255, 0.1)",
  },
  arcBottom: {
    position: "absolute",
    left: -180,
    bottom: -230,
    width: 520,
    height: 520,
    borderRadius: "50%",
    border: "80px solid rgba(78, 151, 255, 0.09)",
  },
  box: {
    position: "relative",
    zIndex: 1,
    width: "min(100%, 500px)",
    padding: "44px 38px 36px",
    borderRadius: 26,
    background: "rgba(255,255,255,0.98)",
    border: "1px solid rgba(217,230,245,0.9)",
    boxShadow: "0 28px 80px rgba(23,58,105,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoImage: {
    width: 124,
    height: 124,
    objectFit: "contain",
    marginBottom: 10,
    filter: "drop-shadow(0 16px 26px rgba(11,115,255,0.18))",
  },
  title: {
    margin: 0,
    color: "#0b73ff",
    fontWeight: 800,
    fontSize: 32,
    textAlign: "center",
  },
  subtitle: {
    margin: "8px 0 28px",
    color: "#63718d",
    fontSize: 16,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  input: {
    width: "100%",
    height: 54,
    padding: "0 16px",
    borderRadius: 10,
    border: "1px solid #bfd6f5",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    fontSize: 16,
    boxSizing: "border-box",
  },
  erro: {
    margin: 0,
    color: "#c0392b",
    fontSize: 12,
    textAlign: "center",
  },
  sucesso: {
    margin: 0,
    color: "#27ae60",
    fontSize: 12,
    textAlign: "center",
  },
  primary: {
    marginTop: 10,
    width: "100%",
    height: 52,
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #0b73ff 0%, #2f86ff 100%)",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: 0.5,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(127,193,245,0.35)",
  },
  secundary: {
    marginTop: 10,
    width: "100%",
    height: 52,
    border: "1px solid #bfd6f5",
    borderRadius: 10,
    background: "#fff",
    color: "#0b73ff",
    fontWeight: 700,
    letterSpacing: 0.5,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(127,193,245,0.35)",
  },
};
