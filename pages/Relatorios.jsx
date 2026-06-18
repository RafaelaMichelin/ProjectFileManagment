import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { pageStyles as s } from "../components/pageStyles";
import { api } from "../services/api";
import { formatarData } from "../utils/date";
import { TABLE_LIMIT } from "../utils/table";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function obterPeriodo(dataStr, periodo) {
  const data = new Date(dataStr);
  if (Number.isNaN(data.getTime())) return null;

  if (periodo === "mensal") return MESES[data.getMonth()];

  const trimestre = Math.floor(data.getMonth() / 3) + 1;
  if (periodo === "trimestral") return `${trimestre}º Trim.`;

  const semestre = data.getMonth() < 6 ? "1º Sem." : "2º Sem.";
  return semestre;
}

export default function Relatorios() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [periodo, setPeriodo] = useState("mensal");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await api.getRelatorios();
      setRegistros(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const tiposDisponiveis = useMemo(() => {
    return [...new Set(registros.map((r) => r.tipo))].sort();
  }, [registros]);

  const statusDisponiveis = useMemo(() => {
    return [...new Set(registros.map((r) => r.status))].sort();
  }, [registros]);

  const dadosFiltrados = useMemo(() => {
    return registros.filter((item) => {
      const statusOk = statusFiltro === "Todos" || item.status === statusFiltro;
      const tipoOk = tipoFiltro === "Todos" || item.tipo === tipoFiltro;
      return statusOk && tipoOk;
    });
  }, [registros, statusFiltro, tipoFiltro]);

  const dadosGrafico = useMemo(() => {
    const ordem = {
      mensal: MESES,
      trimestral: ["1º Trim.", "2º Trim.", "3º Trim.", "4º Trim."],
      semestral: ["1º Sem.", "2º Sem."],
    };

    return ordem[periodo].map((nome) => ({
      nome,
      documentos: dadosFiltrados.filter(
        (item) => obterPeriodo(item.data, periodo) === nome
      ).length,
    }));
  }, [periodo, dadosFiltrados]);

  const totalFiltrado = dadosFiltrados.length;
  const concluidos = dadosFiltrados.filter(
    (item) => item.status === "Finalizado"
  ).length;
  const pendentes = dadosFiltrados.filter(
    (item) => item.status === "Pendente" || item.status === "Recebido"
  ).length;

  return (
    <section style={s.page}>
      <div style={s.topo}>
        <div>
          <h2 style={s.titulo}>Relatórios</h2>
          <p style={s.subtitulo}>
            Consulta detalhada dos documentos cadastrados no sistema.
          </p>
        </div>
      </div>

      <div style={styles.filtrosArea}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Período</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={s.select}
          >
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
          </select>
        </div>

        <div style={s.filtroGrupo}>
          <label style={s.label}>Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={s.select}
          >
            <option>Todos</option>
            {statusDisponiveis.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div style={s.filtroGrupo}>
          <label style={s.label}>Tipo de documento</label>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={s.select}
          >
            <option>Todos</option>
            {tiposDisponiveis.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

      <div style={styles.cardsArea}>
        <div style={{ ...styles.card, borderTop: "5px solid #93c5fd" }}>
          <p style={styles.cardTitulo}>Total filtrado</p>
          <h3 style={styles.cardValor}>{totalFiltrado}</h3>
          <span style={styles.cardDetalhe}>Registros encontrados</span>
        </div>
        <div style={{ ...styles.card, borderTop: "5px solid #bbf7d0" }}>
          <p style={styles.cardTitulo}>Finalizados</p>
          <h3 style={styles.cardValor}>{concluidos}</h3>
          <span style={styles.cardDetalhe}>Concluídos no filtro</span>
        </div>
        <div style={{ ...styles.card, borderTop: "5px solid #fde68a" }}>
          <p style={styles.cardTitulo}>Pendentes</p>
          <h3 style={styles.cardValor}>{pendentes}</h3>
          <span style={styles.cardDetalhe}>Aguardando análise</span>
        </div>
      </div>

      <div style={styles.graficoBox}>
        <h3 style={styles.graficoTitulo}>Documentos Filtrados por Período</h3>
        {carregando ? (
          <p style={s.carregando}>Carregando...</p>
        ) : (
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
        )}
      </div>

      <div style={styles.resumoFiltros}>
        Exibindo <strong>{totalFiltrado}</strong> registro(s). Filtros aplicados:{" "}
        <strong>Período:</strong> {periodo}, <strong>Status:</strong> {statusFiltro},{" "}
        <strong>Tipo:</strong> {tipoFiltro}.
      </div>

      <div style={s.tabelaBox}>
        <h3 style={styles.graficoTitulo}>Relatório Detalhado</h3>
        {carregando ? (
          <p style={s.carregando}>Carregando relatórios...</p>
        ) : (
          <>
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>Código</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Usuário</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Data</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.slice(0, TABLE_LIMIT).map((item, index) => (
                  <tr key={index}>
                    <td style={s.td}>{item.codigo}</td>
                    <td style={s.td}>{item.tipo}</td>
                    <td style={s.td}>{item.usuario}</td>
                    <td style={s.td}>{item.status}</td>
                    <td style={s.td}>{formatarData(item.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dadosFiltrados.length === 0 && (
              <p style={s.vazio}>
                Nenhum registro encontrado para os filtros selecionados.
              </p>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
};
