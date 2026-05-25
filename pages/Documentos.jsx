export default function Documentos() {
  return (
    <section style={styles.page}>
      <h2 style={{ color: "var(--text)" }}>Documentos</h2>
      <p style={{ color: "var(--text)" }}>
        Bla bla bla.
      </p>
    </section>
  );
}

const styles = {
  page: {
    padding: "24px",
    borderRadius: "18px",
    background: "var(--box-bg)",
    minHeight: "320px",
  },
};
