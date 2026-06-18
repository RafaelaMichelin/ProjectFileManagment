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
import { TABLE_LIMIT } from "../utils/table";

const CORES = ["#2f86ff", "#f59e0b", "#10b981", "#ef4444", "#7c3aed", "#fb923c"];

function SvgIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
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

function renderCardIcon(titulo) {
  if (titulo === "Protocolos") {
    return (
      <SvgIcon>
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M8 13h8" />
        <path d="M8 16h5" />
      </SvgIcon>
    );
  }
  if (titulo === "Pendentes") {
    return (
      <SvgIcon>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </SvgIcon>
    );
  }
  if (titulo === "Concluidos") {
    return (
      <SvgIcon>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </SvgIcon>
    );
  }
  return (
    <SvgIcon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </SvgIcon>
  );
}

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
    return <p style={styles.carregando}>Carregando dashboard...</p>;
  }

  if (erro) {
    return <p style={styles.erro}>Erro ao carregar dashboard: {erro}</p>;
  }

  const cards = [
    {
      titulo: "Documentos",
      valor: dados.cards.documentos,
      descricao: "Total cadastrados",
      cor: "#0b73ff",
      fundo: "#e8f2ff",
      icone: "▤",
    },
    {
      titulo: "Protocolos",
      valor: dados.cards.protocolos,
      descricao: "Protocolos criados",
      cor: "#10b981",
      fundo: "#dcfce7",
      icone: "□",
    },
    {
      titulo: "Pendentes",
      valor: dados.cards.pendentes,
      descricao: "Aguardando analise",
      cor: "#f59e0b",
      fundo: "#fef3c7",
      icone: "◷",
    },
    {
      titulo: "Concluidos",
      valor: dados.cards.finalizados,
      descricao: "Finalizados",
      cor: "#7c3aed",
      fundo: "#ede9fe",
      icone: "✓",
    },
  ];

  const protocolosPorStatus = dados.protocolosPorStatus.filter((s) => s.value > 0);

  return (
    <div style={styles.container}>
      <div style={styles.cardsArea}>
        {cards.map((card) => (
          <div key={card.titulo} style={styles.card}>
            <div style={{ ...styles.cardIcon, background: card.fundo, color: card.cor }}>
              {renderCardIcon(card.titulo)}
            </div>
            <div>
              <p style={styles.cardTitulo}>{card.titulo}</p>
              <h3 style={styles.cardValor}>{card.valor}</h3>
              <span style={styles.cardDescricao}>{card.descricao}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.graficosArea}>
        <div style={styles.graficoBox}>
          <div style={styles.boxHeader}>
            <h3 style={styles.graficoTitulo}>Documentos por Tipo</h3>
            <span style={styles.periodo}>Ultimos 30 dias</span>
          </div>
          {dados.documentosPorTipo.length === 0 ? (
            <p style={styles.vazio}>Nenhum documento cadastrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dados.documentosPorTipo}>
                <XAxis dataKey="tipo" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#2f86ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.graficoBox}>
          <div style={styles.boxHeader}>
            <h3 style={styles.graficoTitulo}>Protocolos por Status</h3>
            <span style={styles.periodo}>Ultimos 30 dias</span>
          </div>
          {protocolosPorStatus.length === 0 ? (
            <p style={styles.vazio}>Nenhum protocolo cadastrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={protocolosPorStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={82}
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
        <h3 style={styles.graficoTitulo}>Ultimos Protocolos</h3>
        {dados.ultimosProtocolos.length === 0 ? (
          <p style={styles.vazio}>Nenhum protocolo registrado.</p>
        ) : (
          <table style={styles.tabela}>
            <thead>
              <tr>
                <th style={styles.th}>Protocolo</th>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {dados.ultimosProtocolos.slice(0, TABLE_LIMIT).map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>{item.codigo_protocolo}</td>
                  <td style={styles.td}>{item.usuario}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{item.status}</span>
                  </td>
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
    display: "flex",
    flexDirection: "column",
    gap: "26px",
  },
  carregando: {
    color: "var(--muted)",
    textAlign: "center",
    padding: "40px",
    background: "var(--box-bg)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
  },
  erro: {
    color: "#dc2626",
    textAlign: "center",
    padding: "40px",
    background: "var(--box-bg)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
  },
  cardsArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  card: {
    minHeight: 138,
    background: "var(--box-bg)",
    borderRadius: "16px",
    padding: "28px 24px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--line)",
    display: "grid",
    gridTemplateColumns: "58px 1fr",
    alignItems: "center",
    gap: 18,
    overflow: "hidden",
  },
  cardIcon: {
    width: 58,
    height: 58,
    borderRadius: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 800,
  },
  cardTitulo: { margin: 0, fontSize: "17px", color: "var(--text)" },
  cardValor: {
    margin: "8px 0",
    fontSize: "34px",
    color: "var(--text)",
    lineHeight: 1,
  },
  cardDescricao: { fontSize: "14px", color: "var(--muted)" },
  spark: {
    alignSelf: "end",
    fontSize: 52,
    lineHeight: 1,
    transform: "rotate(-8deg)",
  },
  graficosArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  graficoBox: {
    background: "var(--box-bg)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--line)",
  },
  boxHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  graficoTitulo: { margin: 0, color: "var(--text)", fontSize: 20 },
  periodo: {
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "8px 12px",
    color: "var(--muted)",
    fontSize: 13,
    background: "var(--box-bg)",
  },
  tabelaBox: {
    background: "var(--box-bg)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--line)",
    overflow: "auto",
    height: 420,
    minHeight: 420,
  },
  tabela: { width: "100%", borderCollapse: "collapse", color: "var(--text)", marginTop: 14 },
  th: { textAlign: "left", padding: "14px 12px", borderBottom: "1px solid var(--line)" },
  td: {
    padding: "16px 12px",
    borderBottom: "1px solid var(--line)",
    color: "var(--muted)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 9,
    padding: "6px 12px",
    background: "var(--primary-soft)",
    color: "var(--primary)",
    fontWeight: 700,
    fontSize: 13,
  },
  vazio: { color: "var(--muted)", textAlign: "center" },
};
