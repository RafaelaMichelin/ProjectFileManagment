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
      <div style={styles.box}>
        <h2 style={styles.title}>File Managment</h2>
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
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#d9d9d9",
    padding: "24px",
  },
  box: {
    width: 250,
    minHeight: 360,
    padding: "34px 18px 20px",
    borderRadius: 26,
    background: "#fff",
    boxShadow: "0 10px 18px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    margin: "22px 0 28px",
    color: "#9fd2f3",
    fontFamily: "Inter, sans-serif",
    fontWeight: 400,
    fontSize: "21px",
    textAlign: "center",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    width: "100%",
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid #666",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
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
    height: 36,
    border: "none",
    borderRadius: 8,
    background: "#7fc1f5",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: 0.5,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(127,193,245,0.35)",
  },
  secundary: {
    marginTop: 10,
    width: "100%",
    height: 36,
    border: "none",
    borderRadius: 8,
    background: "#fcfeff",
    color: "#080808",
    fontWeight: 500,
    letterSpacing: 0.5,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(127,193,245,0.35)",
  },
};
