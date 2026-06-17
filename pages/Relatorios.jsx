import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("mensal");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");

  const relatorioGeral = [
    {
      codigo: "SCED-001",
      tipo: "RG",
      usuario: "Maria Souza",
      status: "Concluído",
      data: "10/01/2026",
      mes: "Jan",
      trimestre: "1º Trim.",
      semestre: "1º Sem.",
    },
    {
      codigo: "SCED-002",
      tipo: "CPF",
      usuario: "João Lima",
      status: "Pendente",
      data: "11/02/2026",
      mes: "Fev",
      trimestre: "1º Trim.",
      semestre: "1º Sem.",
    },
    {
      codigo: "SCED-003",
      tipo: "Comprovante",
      usuario: "Ana Costa",
      status: "Em análise",
      data: "12/03/2026",
      mes: "Mar",
      trimestre: "1º Trim.",
      semestre: "1º Sem.",
    },
    {
      codigo: "SCED-004",
      tipo: "Contrato",
      usuario: "Carlos Silva",
      status: "Concluído",
      data: "13/04/2026",
      mes: "Abr",
      trimestre: "2º Trim.",
      semestre: "1º Sem.",
    },
    {
      codigo: "SCED-005",
      tipo: "Outros",
      usuario: "Rafaela Michelin",
      status: "Pendente",
      data: "14/05/2026",
      mes: "Mai",
      trimestre: "2º Trim.",
      semestre: "1º Sem.",
    },
    {
      codigo: "SCED-006",
      tipo: "CPF",
      usuario: "Jhonatan",
      status: "Concluído",
      data: "15/06/2026",
      mes: "Jun",
      trimestre: "2º Trim.",
      semestre: "1º Sem.",
    },
    {
      codigo: "SCED-007",
      tipo: "RG",
      usuario: "Fernanda Alves",
      status: "Concluído",
      data: "18/07/2026",
      mes: "Jul",
      trimestre: "3º Trim.",
      semestre: "2º Sem.",
    },
    {
      codigo: "SCED-008",
      tipo: "CPF",
      usuario: "Lucas Pereira",
      status: "Em análise",
      data: "21/08/2026",
      mes: "Ago",
      trimestre: "3º Trim.",
      semestre: "2º Sem.",
    },
    {
      codigo: "SCED-009",
      tipo: "Contrato",
      usuario: "Paula Santos",
      status: "Pendente",
      data: "03/09/2026",
      mes: "Set",
      trimestre: "3º Trim.",
      semestre: "2º Sem.",
    },
    {
      codigo: "SCED-010",
      tipo: "Comprovante",
      usuario: "Marcos Lima",
      status: "Concluído",
      data: "09/10/2026",
      mes: "Out",
      trimestre: "4º Trim.",
      semestre: "2º Sem.",
    },
    {
      codigo: "SCED-011",
      tipo: "Outros",
      usuario: "Beatriz Rocha",
      status: "Pendente",
      data: "17/11/2026",
      mes: "Nov",
      trimestre: "4º Trim.",
      semestre: "2º Sem.",
    },
    {
      codigo: "SCED-012",
      tipo: "RG",
      usuario: "Pedro Henrique",
      status: "Concluído",
      data: "22/12/2026",
      mes: "Dez",
      trimestre: "4º Trim.",
      semestre: "2º Sem.",
    },
  ];

  const dadosFiltrados = useMemo(() => {
    return relatorioGeral.filter((item) => {
      const statusOk = statusFiltro === "Todos" || item.status === statusFiltro;
      const tipoOk = tipoFiltro === "Todos" || item.tipo === tipoFiltro;

      return statusOk && tipoOk;
    });
  }, [statusFiltro, tipoFiltro]);

  const dadosGrafico = useMemo(() => {
    const ordem = {
      mensal: [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ],
      trimestral: ["1º Trim.", "2º Trim.", "3º Trim.", "4º Trim."],
      semestral: ["1º Sem.", "2º Sem."],
    };

    const chave = {
      mensal: "mes",
      trimestral: "trimestre",
      semestral: "semestre",
    };

    return ordem[periodo].map((nome) => ({
      nome,
      documentos: dadosFiltrados.filter((item) => item[chave[periodo]] === nome)
        .length,
    }));
  }, [periodo, dadosFiltrados]);

  const totalFiltrado = dadosFiltrados.length;
  const concluidos = dadosFiltrados.filter(
    (item) => item.status === "Concluído",
  ).length;
  const pendentes = dadosFiltrados.filter(
    (item) => item.status === "Pendente",
  ).length;

  return (
    <section style={styles.page}>
      <div style={styles.topo}>
        <div>
          <h2 style={styles.titulo}>Relatórios</h2>
          <p style={styles.subtitulo}>
            Consulta detalhada dos documentos cadastrados no sistema.
          </p>
        </div>
      </div>

      <div style={styles.filtrosArea}>
        <div style={styles.filtroGrupo}>
          <label style={styles.label}>Período</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={styles.select}
          >
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
          </select>
        </div>

        <div style={styles.filtroGrupo}>
          <label style={styles.label}>Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={styles.select}
          >
            <option>Todos</option>
            <option>Concluído</option>
            <option>Pendente</option>
            <option>Em análise</option>
          </select>
        </div>

        <div style={styles.filtroGrupo}>
          <label style={styles.label}>Tipo de documento</label>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={styles.select}
          >
            <option>Todos</option>
            <option>RG</option>
            <option>CPF</option>
            <option>Comprovante</option>
            <option>Contrato</option>
            <option>Outros</option>
          </select>
        </div>
      </div>

      <div style={styles.cardsArea}>
        <div style={{ ...styles.card, borderTop: "5px solid #93c5fd" }}>
          <p style={styles.cardTitulo}>Total filtrado</p>
          <h3 style={styles.cardValor}>{totalFiltrado}</h3>
          <span style={styles.cardDetalhe}>Registros encontrados</span>
        </div>

        <div style={{ ...styles.card, borderTop: "5px solid #bbf7d0" }}>
          <p style={styles.cardTitulo}>Concluídos</p>
          <h3 style={styles.cardValor}>{concluidos}</h3>
          <span style={styles.cardDetalhe}>Finalizados no filtro</span>
        </div>

        <div style={{ ...styles.card, borderTop: "5px solid #fde68a" }}>
          <p style={styles.cardTitulo}>Pendentes</p>
          <h3 style={styles.cardValor}>{pendentes}</h3>
          <span style={styles.cardDetalhe}>Aguardando análise</span>
        </div>
      </div>

      <div style={styles.graficoBox}>
        <h3 style={styles.graficoTitulo}>Documentos Filtrados por Período</h3>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dadosGrafico}>
            <XAxis dataKey="nome" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="documentos"
              stroke="#93c5fd"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.resumoFiltros}>
        Exibindo <strong>{totalFiltrado}</strong> registro(s). Filtros
        aplicados: <strong>Período:</strong> {periodo}, <strong>Status:</strong>{" "}
        {statusFiltro}, <strong>Tipo:</strong> {tipoFiltro}.
      </div>

      <div style={styles.tabelaBox}>
        <h3 style={styles.graficoTitulo}>Relatório Detalhado</h3>

        <table style={styles.tabela}>
          <thead>
            <tr>
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Usuário</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Data</th>
            </tr>
          </thead>

          <tbody>
            {dadosFiltrados.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.codigo}</td>
                <td style={styles.td}>{item.tipo}</td>
                <td style={styles.td}>{item.usuario}</td>
                <td style={styles.td}>{item.status}</td>
                <td style={styles.td}>{item.data}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {dadosFiltrados.length === 0 && (
          <p style={styles.vazio}>
            Nenhum registro encontrado para os filtros selecionados.
          </p>
        )}
      </div>
    </section>
  );
}

const styles = {
  page: {
    padding: "28px",
    borderRadius: "18px",
    background: "var(--box-bg)",
    minHeight: "320px",
  },

  topo: {
    marginBottom: "20px",
  },

  titulo: {
    color: "var(--text)",
    margin: 0,
    fontSize: "28px",
  },

  subtitulo: {
    color: "var(--text)",
    opacity: 0.7,
    marginTop: "8px",
    marginBottom: 0,
  },

  filtrosArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  filtroGrupo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    color: "var(--text)",
    fontSize: "14px",
    opacity: 0.8,
  },

  select: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "14px",
    cursor: "pointer",
  },

  cardsArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  card: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "16px",
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

  cardDetalhe: {
    fontSize: "13px",
    opacity: 0.7,
  },

  graficoBox: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "18px",
  },

  graficoTitulo: {
    marginTop: 0,
    marginBottom: "16px",
    color: "var(--text)",
  },

  resumoFiltros: {
    background: "var(--bg)",
    color: "var(--text)",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "18px",
    fontSize: "14px",
    opacity: 0.9,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
    color: "var(--text)",
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

  vazio: {
    color: "var(--text)",
    opacity: 0.7,
    marginTop: "16px",
  },
};
