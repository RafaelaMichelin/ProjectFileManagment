import { useEffect, useState } from "react";
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
import { api } from "../services/api";
import { formatarData } from "../utils/date";

const CORES = ["#93c5fd", "#facc15", "#86efac", "#fca5a5", "#c4b5fd", "#fdba74"];

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .getDashboard()
      .then(setDados)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div style={styles.container}>
        <p style={styles.carregando}>Carregando dashboard...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={styles.container}>
        <p style={styles.erro}>Erro ao carregar dashboard: {erro}</p>
      </div>
    );
  }

  const cards = [
    {
      titulo: "Documentos",
      valor: dados.cards.documentos,
      descricao: "Total cadastrados",
      cor: "#93c5fd",
    },
    {
      titulo: "Protocolos",
      valor: dados.cards.protocolos,
      descricao: "Protocolos criados",
      cor: "#bfdbfe",
    },
    {
      titulo: "Pendentes",
      valor: dados.cards.pendentes,
      descricao: "Aguardando análise",
      cor: "#fde68a",
    },
    {
      titulo: "Concluídos",
      valor: dados.cards.finalizados,
      descricao: "Finalizados",
      cor: "#bbf7d0",
    },
  ];

  const protocolosPorStatus = dados.protocolosPorStatus.filter((s) => s.value > 0);

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
          {dados.documentosPorTipo.length === 0 ? (
            <p style={styles.vazio}>Nenhum documento cadastrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dados.documentosPorTipo}>
                <XAxis dataKey="tipo" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#93c5fd" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.graficoBox}>
          <h3 style={styles.graficoTitulo}>Protocolos por Status</h3>
          {protocolosPorStatus.length === 0 ? (
            <p style={styles.vazio}>Nenhum protocolo cadastrado.</p>
          ) : (
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
                    <Cell key={index} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={styles.tabelaBox}>
        <h3 style={styles.graficoTitulo}>Últimos Protocolos</h3>
        {dados.ultimosProtocolos.length === 0 ? (
          <p style={styles.vazio}>Nenhum protocolo registrado.</p>
        ) : (
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
              {dados.ultimosProtocolos.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>{item.codigo_protocolo}</td>
                  <td style={styles.td}>{item.usuario}</td>
                  <td style={styles.td}>{item.status}</td>
                  <td style={styles.td}>{formatarData(item.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  titulo: { margin: 0, fontSize: "28px", color: "var(--text)" },
  subtitulo: {
    marginTop: "8px",
    marginBottom: "24px",
    color: "var(--text)",
    opacity: 0.7,
  },
  carregando: { color: "var(--text)", opacity: 0.7, textAlign: "center", padding: "40px" },
  erro: { color: "#dc2626", textAlign: "center", padding: "40px" },
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
  cardTitulo: { margin: 0, fontSize: "15px", opacity: 0.8, color: "var(--text)" },
  cardValor: { margin: "10px 0", fontSize: "30px", color: "var(--text)" },
  cardDescricao: { fontSize: "13px", opacity: 0.7, color: "var(--text)" },
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
  graficoTitulo: { marginTop: 0, marginBottom: "16px", color: "var(--text)" },
  tabelaBox: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },
  tabela: { width: "100%", borderCollapse: "collapse", color: "var(--text)" },
  th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #ccc" },
  td: { padding: "12px", borderBottom: "1px solid rgba(180,180,180,0.3)" },
  vazio: { color: "var(--text)", opacity: 0.7, textAlign: "center" },
};
