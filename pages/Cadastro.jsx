export default function Cadastro() {
  return (
    <section style={styles.page}>
      <form style={styles.form}>
        <label> 
          Nome Completo:
          <input type="text" name="name" />
        </label>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label> 
          Senha:
          <input type="password" name="password" />
        </label>
        <label>
          Confirmar Senha:
          <input type="password" name="confirmPassword" />
        </label>
        <button type="submit">Cadastrar</button>
        </form>
    </section>
  );
}

const styles = {
  page: {
    padding: "24px",
    borderRadius: "18px",
    background: "var(--box-bg)",
    minHeight: "320px",
    color: "var(--text)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
    borderRadius: "8px",
  },

};
