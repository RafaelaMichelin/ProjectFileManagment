import React, { useState } from "react";

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

function IconMail() {
  return (
    <SvgIcon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </SvgIcon>
  );
}

export default function ForgotPassword({ onNavigate }) {
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
      setMensagem(
        "Se este e-mail estiver cadastrado, enviaremos instrucoes para redefinir sua senha."
      );
    } catch {
      setErro("Erro ao solicitar recuperacao de senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section style={styles.container}>
      <div style={styles.arcTop} />
      <div style={styles.arcBottom} />
      <div style={styles.dotsLeft} />
      <div style={styles.dotsRight} />

      <div style={styles.box}>
        <img src="/fm-logo.png" alt="File Management" style={styles.logoImage} />
        <h2 style={styles.title}>Recuperar Senha</h2>
        <p style={styles.subtitle}>Informe seu e-mail para receber as instrucoes</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.inputWrap}>
            <span style={styles.inputIcon}>
              <IconMail />
            </span>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          {erro && <p style={styles.erro}>{erro}</p>}
          {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

          <button type="submit" style={styles.primary} disabled={carregando}>
            {carregando ? "ENVIANDO..." : "ENVIAR LINK"}
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("login")}
            style={styles.back}
          >
            Voltar para Login
          </button>
        </form>
      </div>
    </section>
  );
}

const dotPattern =
  "radial-gradient(circle, rgba(11,115,255,0.16) 0 3px, transparent 4px)";

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
  dotsLeft: {
    position: "absolute",
    top: 28,
    left: 30,
    width: 150,
    height: 210,
    backgroundImage: dotPattern,
    backgroundSize: "26px 26px",
  },
  dotsRight: {
    position: "absolute",
    right: 60,
    bottom: 70,
    width: 150,
    height: 140,
    backgroundImage: dotPattern,
    backgroundSize: "26px 26px",
  },
  box: {
    position: "relative",
    zIndex: 1,
    width: "min(100%, 500px)",
    padding: "48px 38px 40px",
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
    textAlign: "center",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputWrap: {
    height: 58,
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid #bfd6f5",
    borderRadius: 10,
    background: "#fff",
    padding: "0 18px",
  },
  inputIcon: {
    color: "#0b73ff",
    display: "inline-flex",
  },
  input: {
    width: "100%",
    border: 0,
    outline: 0,
    color: "#071733",
    fontSize: 16,
    background: "transparent",
  },
  erro: {
    margin: 0,
    color: "#dc2626",
    fontSize: 13,
    textAlign: "center",
  },
  sucesso: {
    margin: 0,
    color: "#16a34a",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 1.4,
  },
  primary: {
    marginTop: 10,
    width: "100%",
    height: 58,
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #0b73ff 0%, #2f86ff 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(11,115,255,0.28)",
  },
  back: {
    background: "none",
    border: "none",
    padding: 0,
    marginTop: 4,
    color: "#0b73ff",
    fontSize: 16,
    cursor: "pointer",
  },
};
