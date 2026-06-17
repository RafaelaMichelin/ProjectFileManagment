import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const cards = [
    {
      titulo: "Documentos",
      valor: 128,
      descricao: "Total cadastrados",
      cor: "#93c5fd",
    },
    {
      titulo: "Protocolos",
      valor: 42,
      descricao: "Protocolos criados",
      cor: "#bfdbfe",
    },
    {
      titulo: "Pendentes",
      valor: 16,
      descricao: "Aguardando análise",
      cor: "#fde68a",
    },
    {
      titulo: "Concluídos",
      valor: 26,
      descricao: "Finalizados",
      cor: "#bbf7d0",
    },
  ];

  const documentosPorTipo = [
    { tipo: "RG", quantidade: 30 },
    { tipo: "CPF", quantidade: 28 },
    { tipo: "Comprovante", quantidade: 22 },
    { tipo: "Contrato", quantidade: 18 },
    { tipo: "Outros", quantidade: 30 },
  ];

  const protocolosPorStatus = [
    { name: "Pendente", value: 16 },
    { name: "Em análise", value: 10 },
    { name: "Concluído", value: 26 },
  ];

  const ultimosProtocolos = [
    {
      codigo: "SCED-001",
      usuario: "Maria Souza",
      status: "Concluído",
      data: "10/06/2026",
    },
    {
      codigo: "SCED-002",
      usuario: "João Lima",
      status: "Pendente",
      data: "11/06/2026",
    },
    {
      codigo: "SCED-003",
      usuario: "Ana Costa",
      status: "Em análise",
      data: "12/06/2026",
    },
    {
      codigo: "SCED-004",
      usuario: "Carlos Silva",
      status: "Pendente",
      data: "13/06/2026",
    },
  ];

  const cores = ["#93c5fd", "#facc15", "#86efac"];

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Dashboard Geral</h2>
      <p style={styles.subtitulo}>
        Visão geral dos documentos, protocolos e movimentações do sistema.
      </p>

      <div style={styles.cardsArea}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{ ...styles.card, borderTop: `5px solid ${card.cor}` }}
          >
            <p style={styles.cardTitulo}>{card.titulo}</p>
            <h3 style={styles.cardValor}>{card.valor}</h3>
            <span style={styles.cardDescricao}>{card.descricao}</span>
          </div>
        ))}
      </div>

      <div style={styles.graficosArea}>
        <div style={styles.graficoBox}>
          <h3 style={styles.graficoTitulo}>Documentos por Tipo</h3>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={documentosPorTipo}>
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#93c5fd" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.graficoBox}>
          <h3 style={styles.graficoTitulo}>Protocolos por Status</h3>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={protocolosPorStatus}
                dataKey="value"
                nameKey="name"
                outerRadius={72}
                label
              >
                {protocolosPorStatus.map((_, index) => (
                  <Cell key={index} fill={cores[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.tabelaBox}>
        <h3 style={styles.graficoTitulo}>Últimos Protocolos</h3>

        <table style={styles.tabela}>
          <thead>
            <tr>
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Usuário</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Data</th>
            </tr>
          </thead>

          <tbody>
            {ultimosProtocolos.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.codigo}</td>
                <td style={styles.td}>{item.usuario}</td>
                <td style={styles.td}>{item.status}</td>
                <td style={styles.td}>{item.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "420px",
    padding: "28px",
    borderRadius: "16px",
    background: "var(--box-bg)",
  },

  titulo: {
    margin: 0,
    fontSize: "28px",
  },

  subtitulo: {
    marginTop: "8px",
    marginBottom: "24px",
    color: "var(--text)",
    opacity: 0.7,
  },

  cardsArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  card: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardTitulo: {
    margin: 0,
    fontSize: "15px",
    opacity: 0.8,
  },

  cardValor: {
    margin: "10px 0",
    fontSize: "30px",
  },

  cardDescricao: {
    fontSize: "13px",
    opacity: 0.7,
  },

  graficosArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  graficoBox: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  graficoTitulo: {
    marginTop: 0,
    marginBottom: "16px",
  },

  tabelaBox: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },

  tabela: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #ccc",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(180,180,180,0.3)",
  },
};
