export default function Modal({ titulo, onFechar, children, largura = 480 }) {
  return (
    <div style={styles.overlay} onClick={onFechar}>
      <div
        style={{ ...styles.modal, maxWidth: largura }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.cabecalho}>
          <h3 style={styles.titulo}>{titulo}</h3>
          <button type="button" onClick={onFechar} style={styles.fechar}>
            ×
          </button>
        </div>
        <div style={styles.corpo}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(7, 23, 51, 0.42)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    width: "100%",
    background: "var(--box-bg)",
    borderRadius: "16px",
    boxShadow: "0 24px 70px rgba(7, 23, 51, 0.22)",
    border: "1px solid var(--line)",
    maxHeight: "90vh",
    overflow: "auto",
  },
  cabecalho: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px",
    borderBottom: "1px solid var(--line)",
  },
  titulo: {
    margin: 0,
    color: "var(--text)",
    fontSize: "20px",
  },
  fechar: {
    width: 36,
    height: 36,
    background: "var(--primary-soft)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
    color: "var(--text)",
    opacity: 0.6,
  },
  corpo: {
    padding: "22px",
  },
};
