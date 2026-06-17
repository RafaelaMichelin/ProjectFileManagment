import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Logs() {
  const [acaoFiltro, setAcaoFiltro] = useState("Todas");
  const [usuarioFiltro, setUsuarioFiltro] = useState("Todos");

  const logsSistema = [
    {
      data: "10/06/2026",
      hora: "08:15",
      usuario: "Maria Souza",
      acao: "Login",
      descricao: "Usuário acessou o sistema.",
    },
    {
      data: "10/06/2026",
      hora: "09:20",
      usuario: "João Lima",
      acao: "Cadastro",
      descricao: "Novo documento cadastrado.",
    },
    {
      data: "11/06/2026",
      hora: "10:05",
      usuario: "Ana Costa",
      acao: "Alteração",
      descricao: "Status do protocolo alterado para Em análise.",
    },
    {
      data: "11/06/2026",
      hora: "11:30",
      usuario: "Carlos Silva",
      acao: "Exclusão",
      descricao: "Registro removido do sistema.",
    },
    {
      data: "12/06/2026",
      hora: "14:10",
      usuario: "Rafaela Michelin",
      acao: "Cadastro",
      descricao: "Novo protocolo registrado.",
    },
    {
      data: "12/06/2026",
      hora: "15:45",
      usuario: "Jhonatan",
      acao: "Alteração",
      descricao: "Dados de documento foram atualizados.",
    },
    {
      data: "13/06/2026",
      hora: "08:50",
      usuario: "Maria Souza",
      acao: "Login",
      descricao: "Usuário acessou o sistema.",
    },
    {
      data: "13/06/2026",
      hora: "16:25",
      usuario: "João Lima",
      acao: "Cadastro",
      descricao: "Documento CPF enviado ao sistema.",
    },
  ];

  const logsFiltrados = useMemo(() => {
    return logsSistema.filter((log) => {
      const acaoOk = acaoFiltro === "Todas" || log.acao === acaoFiltro;
      const usuarioOk =
        usuarioFiltro === "Todos" || log.usuario === usuarioFiltro;
      return acaoOk && usuarioOk;
    });
  }, [acaoFiltro, usuarioFiltro]);

  const dadosGrafico = useMemo(() => {
    const datas = ["10/06", "11/06", "12/06", "13/06"];

    return datas.map((dia) => ({
      dia,
      eventos: logsFiltrados.filter((log) => log.data.startsWith(dia)).length,
    }));
  }, [logsFiltrados]);

  const totalEventos = logsFiltrados.length;
  const totalLogins = logsFiltrados.filter(
    (log) => log.acao === "Login",
  ).length;
  const totalAlteracoes = logsFiltrados.filter(
    (log) => log.acao === "Alteração",
  ).length;

  const getAcaoStyle = (acao) => {
    const estilos = {
      Login: { color: "#2563eb", fontWeight: "600" },
      Cadastro: { color: "#16a34a", fontWeight: "600" },
      Alteração: { color: "#ca8a04", fontWeight: "600" },
      Exclusão: { color: "#dc2626", fontWeight: "600" },
    };

    return estilos[acao] || {};
  };

  return (
    <section style={styles.page}>
      <div style={styles.topo}>
        <div>
          <h2 style={styles.titulo}>Logs do Sistema</h2>
          <p style={styles.subtitulo}>
            Acompanhamento das ações realizadas pelos usuários no sistema.
          </p>
        </div>
      </div>

      <div style={styles.filtrosArea}>
        <div style={styles.filtroGrupo}>
          <label style={styles.label}>Tipo de ação</label>
          <select
            value={acaoFiltro}
            onChange={(e) => setAcaoFiltro(e.target.value)}
            style={styles.select}
          >
            <option>Todas</option>
            <option>Login</option>
            <option>Cadastro</option>
            <option>Alteração</option>
            <option>Exclusão</option>
          </select>
        </div>

        <div style={styles.filtroGrupo}>
          <label style={styles.label}>Usuário</label>
          <select
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            style={styles.select}
          >
            <option>Todos</option>
            <option>Maria Souza</option>
            <option>João Lima</option>
            <option>Ana Costa</option>
            <option>Carlos Silva</option>
            <option>Rafaela Michelin</option>
            <option>Jhonatan</option>
          </select>
        </div>
      </div>

      <div style={styles.cardsArea}>
        <div style={{ ...styles.card, borderTop: "5px solid #93c5fd" }}>
          <p style={styles.cardTitulo}>Total de Eventos</p>
          <h3 style={styles.cardValor}>{totalEventos}</h3>
          <span style={styles.cardDetalhe}>Eventos encontrados</span>
        </div>

        <div style={{ ...styles.card, borderTop: "5px solid #bfdbfe" }}>
          <p style={styles.cardTitulo}>Logins</p>
          <h3 style={styles.cardValor}>{totalLogins}</h3>
          <span style={styles.cardDetalhe}>Acessos ao sistema</span>
        </div>

        <div style={{ ...styles.card, borderTop: "5px solid #fde68a" }}>
          <p style={styles.cardTitulo}>Alterações</p>
          <h3 style={styles.cardValor}>{totalAlteracoes}</h3>
          <span style={styles.cardDetalhe}>Registros atualizados</span>
        </div>
      </div>

      <div style={styles.graficoBox}>
        <h3 style={styles.graficoTitulo}>Eventos Registrados por Dia</h3>

        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={dadosGrafico}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <XAxis dataKey="dia" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="eventos"
              fill="#93c5fd"
              radius={[8, 8, 0, 0]}
              barSize={70}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.resumoFiltros}>
        <p style={styles.resumoTitulo}>Filtros ativos</p>

        <div style={styles.resumoLinha}>
          <span>
            <strong>Ação:</strong> {acaoFiltro}
          </span>

          <span>
            <strong>Usuário:</strong> {usuarioFiltro}
          </span>
        </div>

        <p style={styles.resumoTexto}>
          Exibindo <strong>{totalEventos}</strong> evento(s) registrado(s).
        </p>
      </div>

      <div style={styles.tabelaBox}>
        <h3 style={styles.graficoTitulo}>Histórico de Atividades</h3>

        <table style={styles.tabela}>
          <thead>
            <tr>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Hora</th>
              <th style={styles.th}>Usuário</th>
              <th style={styles.th}>Ação</th>
              <th style={styles.th}>Descrição</th>
            </tr>
          </thead>

          <tbody>
            {logsFiltrados.map((log, index) => (
              <tr key={index}>
                <td style={styles.td}>{log.data}</td>
                <td style={styles.td}>{log.hora}</td>
                <td style={styles.td}>{log.usuario}</td>
                <td style={{ ...styles.td, ...getAcaoStyle(log.acao) }}>
                  {log.acao}
                </td>
                <td style={styles.td}>{log.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logsFiltrados.length === 0 && (
          <p style={styles.vazio}>
            Nenhum log encontrado para os filtros selecionados.
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

  resumoTitulo: {
    margin: "0 0 8px 0",
    fontWeight: "700",
  },

  resumoLinha: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    marginBottom: "8px",
  },

  resumoTexto: {
    margin: 0,
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
