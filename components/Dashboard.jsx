export default function Dashboard() {
  return (
    <section style={styles.dashboardBox}>
      <p>Dashboards Gerais</p>
    </section>
  );
}

const styles = {
  dashboardBox: {
    width: "100%",
    minHeight: "420px",
    padding: "40px",
    borderRadius: "18px",
    background: "#d7d7d7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
