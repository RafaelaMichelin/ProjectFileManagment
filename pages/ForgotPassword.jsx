import React, { useState } from "react";

export default function ForgotPassword ({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      // Chamada para API futuramente
      // await api.recuperarSenha(email);

      setMensagem(
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha."
      );
    } catch (error) {
      setErro("Erro ao solicitar recuperação de senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Recuperar Senha</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          {erro && <p style={styles.erro}>{erro}</p>}
          {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

          <button
            type="submit"
            style={styles.primary}
            disabled={carregando}
          >
            {carregando ? "ENVIANDO..." : "ENVIAR LINK"}
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("login")}
            style={styles.back}
          >
            Voltar para Login
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
    minHeight: 320,
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
  back: {
    background: "none",
    border: "none",
    padding: 0,
    marginTop: 8,
    color: "#9fd2f3",
    fontSize: 12,
    cursor: "pointer",
  },
};