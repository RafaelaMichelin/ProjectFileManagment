export default function Cadastro({ onRegistered, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você integraria com a API de cadastro.
    if (onRegistered) onRegistered();
  };

  return (
    <section style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>File Managment</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          
          <input placeholder="Nome Completo" style={styles.input} type="text" name="name" />
        </label>
        <label>
          
          <input  placeholder="Email" style={styles.input} type="email" name="email" />
        </label>
        <label>
          <input placeholder="Senha" style={styles.input} type="password" name="password" />
        </label>
        <label>
          <input  placeholder="Confirmar Senha"style={styles.input} type="password" name="confirmPassword" />
        </label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" style={styles.primary}>
            Cadastrar
          </button>
          <button  style={styles.secundary} type="button" onClick={() => onCancel && onCancel()}>Voltar</button>
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
