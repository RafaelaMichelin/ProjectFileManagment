import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { pageStyles as s } from "../components/pageStyles";
import { api } from "../services/api";
import { classificarAcao, formatarData, formatarHora } from "../utils/date";
import { TABLE_LIMIT } from "../utils/table";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoFiltro, setAcaoFiltro] = useState("Todas");
  const [usuarioFiltro, setUsuarioFiltro] = useState("Todos");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [lista, stats] = await Promise.all([api.getLogs(), api.getLogsStats()]);
      setLogs(
        lista.map((log) => ({
          ...log,
          acaoTipo: classificarAcao(log.acao),
          data: formatarData(log.data_log),
          hora: formatarHora(log.data_log),
        }))
      );
      setUsuariosLista(stats.usuarios || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      const acaoOk = acaoFiltro === "Todas" || log.acaoTipo === acaoFiltro;
      const usuarioOk =
        usuarioFiltro === "Todos" || log.nome_usuario === usuarioFiltro;
      return acaoOk && usuarioOk;
    });
  }, [logs, acaoFiltro, usuarioFiltro]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [acaoFiltro, usuarioFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(logsFiltrados.length / TABLE_LIMIT));
  const inicioPagina = (paginaAtual - 1) * TABLE_LIMIT;
  const logsPaginados = logsFiltrados.slice(inicioPagina, inicioPagina + TABLE_LIMIT);

  const dadosGrafico = useMemo(() => {
    const contagem = {};
    logsFiltrados.forEach((log) => {
      contagem[log.data] = (contagem[log.data] || 0) + 1;
    });
    return Object.entries(contagem)
      .map(([dia, eventos]) => ({ dia, eventos }))
      .slice(0, 7)
      .reverse();
  }, [logsFiltrados]);

  const totalEventos = logsFiltrados.length;
  const totalLogins = logsFiltrados.filter((log) => log.acaoTipo === "Login").length;
  const totalAlteracoes = logsFiltrados.filter(
    (log) => log.acaoTipo === "Alteração"
  ).length;

  const getAcaoStyle = (acao) => {
    const estilos = {
      Login: { color: "#2563eb", fontWeight: "600" },
      Cadastro: { color: "#16a34a", fontWeight: "600" },
      Alteração: { color: "#ca8a04", fontWeight: "600" },
      Exclusão: { color: "#dc2626", fontWeight: "600" },
      Outros: { color: "var(--text)", fontWeight: "600" },
    };
    return estilos[acao] || {};
  };

  return (
    <section style={s.page}>
      <div style={s.topo}>
        <div>
          <h2 style={s.titulo}>Logs do Sistema</h2>
          <p style={s.subtitulo}>
            Acompanhamento das ações realizadas pelos usuários no sistema.
          </p>
        </div>
      </div>

      <div style={styles.filtrosArea}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Tipo de ação</label>
          <select
            value={acaoFiltro}
            onChange={(e) => setAcaoFiltro(e.target.value)}
            style={s.select}
          >
            <option>Todas</option>
            <option>Login</option>
            <option>Cadastro</option>
            <option>Alteração</option>
            <option>Exclusão</option>
            <option>Outros</option>
          </select>
        </div>

        <div style={s.filtroGrupo}>
          <label style={s.label}>Usuário</label>
          <select
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            style={s.select}
          >
            <option>Todos</option>
            {usuariosLista.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

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
        {carregando ? (
          <p style={s.carregando}>Carregando...</p>
        ) : dadosGrafico.length === 0 ? (
          <p style={s.vazio}>Sem dados para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={dadosGrafico}>
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
        )}
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

      <div style={s.tabelaBox}>
        <h3 style={styles.graficoTitulo}>Histórico de Atividades</h3>
        {carregando ? (
          <p style={s.carregando}>Carregando logs...</p>
        ) : (
          <>
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>Data</th>
                  <th style={s.th}>Hora</th>
                  <th style={s.th}>Usuário</th>
                  <th style={s.th}>Ação</th>
                  <th style={s.th}>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {logsPaginados.map((log) => (
                  <tr key={log.id_log}>
                    <td style={s.td}>{log.data}</td>
                    <td style={s.td}>{log.hora}</td>
                    <td style={s.td}>{log.nome_usuario || "-"}</td>
                    <td style={{ ...s.td, ...getAcaoStyle(log.acaoTipo) }}>
                      {log.acaoTipo}
                    </td>
                    <td style={s.td}>{log.acao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logsFiltrados.length === 0 && (
              <p style={s.vazio}>Nenhum log encontrado para os filtros selecionados.</p>
            )}
            {logsFiltrados.length > 0 && (
              <div style={styles.paginacao}>
                <span style={styles.paginacaoTexto}>
                  Mostrando {inicioPagina + 1} a{" "}
                  {Math.min(inicioPagina + TABLE_LIMIT, logsFiltrados.length)} de{" "}
                  {logsFiltrados.length} registros
                </span>
                <div style={styles.paginacaoAcoes}>
                  <button
                    type="button"
                    style={styles.paginacaoBotao}
                    disabled={paginaAtual === 1}
                    onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <span style={styles.paginacaoNumero}>
                    {paginaAtual} / {totalPaginas}
                  </span>
                  <button
                    type="button"
                    style={styles.paginacaoBotao}
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  >
                    Proxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const styles = {
  filtrosArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  cardsArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  card: {
    background: "var(--box-bg)",
    borderRadius: "16px",
    padding: "18px",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow-soft)",
  },
  cardTitulo: { margin: 0, fontSize: "15px", opacity: 0.8, color: "var(--text)" },
  cardValor: { margin: "10px 0", fontSize: "30px", color: "var(--text)" },
  cardDetalhe: { fontSize: "13px", opacity: 0.7, color: "var(--text)" },
  graficoBox: {
    background: "var(--box-bg)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow-soft)",
    marginBottom: "18px",
  },
  graficoTitulo: { marginTop: 0, marginBottom: "16px", color: "var(--text)" },
  resumoFiltros: {
    background: "var(--box-bg)",
    color: "var(--text)",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "18px",
    fontSize: "14px",
    opacity: 0.9,
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow-soft)",
  },
  resumoTitulo: { margin: "0 0 8px 0", fontWeight: "700" },
  resumoLinha: { display: "flex", flexWrap: "wrap", gap: "18px", marginBottom: "8px" },
  resumoTexto: { margin: 0 },
  paginacao: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    paddingTop: "14px",
    marginTop: "8px",
    borderTop: "1px solid var(--line)",
    flexWrap: "wrap",
  },
  paginacaoTexto: {
    color: "var(--muted)",
    fontSize: "14px",
  },
  paginacaoAcoes: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  paginacaoBotao: {
    border: "1px solid var(--line)",
    background: "var(--field-bg)",
    color: "var(--text)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 700,
  },
  paginacaoNumero: {
    color: "var(--primary)",
    fontWeight: 800,
    fontSize: "14px",
    minWidth: "54px",
    textAlign: "center",
  },
};
