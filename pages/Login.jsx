import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const STORAGE_KEY = "sced_login_lembrar";

function carregarLoginSalvo() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return null;
    return JSON.parse(salvo);
  } catch {
    return null;
  }
}

export default function Login({ onLoginSuccess, onNavigate }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const salvo = carregarLoginSalvo();
    if (salvo) {
      setForm({
        email: salvo.email || "",
        senha: salvo.senha || "",
      });
      setLembrar(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = await api.login(form.email, form.senha);

      if (lembrar) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email: form.email, senha: form.senha })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (onLoginSuccess) onLoginSuccess(data.usuario);
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
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={form.senha}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {erro && <p style={styles.erro}>{erro}</p>}

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            <span>Lembrar de mim</span>
          </label>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("forgot-password")}
            style={styles.forgot}
          >
            Esqueci minha senha
          </button>

          <button type="submit" style={styles.primary} disabled={carregando}>
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("register")}
            style={styles.register}
          >
            Cadastrar-se
          </button>
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
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#333",
    marginTop: 2,
  },
  checkbox: {
    width: 14,
    height: 14,
  },
  forgot: {
    background: "none",
    border: "none",
    padding: 0,
    textAlign: "left",
    color: "#9fd2f3",
    fontSize: 12,
    cursor: "pointer",
    marginTop: -2,
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
  register: {
    background: "none",
    border: "none",
    padding: 0,
    marginTop: 2,
    color: "#9fd2f3",
    fontSize: 12,
    cursor: "pointer",
  },
};
