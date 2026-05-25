export default function Dashboard() {
  return (
    <section style={styles.dashboardBox}>
      <p style={{ color: "var(--text)" }}>Dashboards Gerais</p>
    </section>
  );
}

const styles = {
  dashboardBox: {
    width: "100%",
    minHeight: "420px",
    padding: "40px",
    borderRadius: "18px",
    background: "var(--box-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
