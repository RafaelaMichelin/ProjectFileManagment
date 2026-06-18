import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import IconButton, {
  IconVer,
  IconExcluir,
  IconMovimentar,
  IconReenviar,
} from "../components/IconButton";
import { pageStyles as s } from "../components/pageStyles";
import { api } from "../services/api";
import { formatarData } from "../utils/date";
import { TABLE_LIMIT } from "../utils/table";

function statusBadgeStyle(status) {
  const cores = {
    Recebido: { bg: "#dbeafe", color: "#1d4ed8" },
    Pendente: { bg: "#fef3c7", color: "#b45309" },
    "Em análise": { bg: "#e0e7ff", color: "#4338ca" },
    Encaminhado: { bg: "#f3e8ff", color: "#7e22ce" },
    Finalizado: { bg: "#dcfce7", color: "#15803d" },
  };
  const c = cores[status] || { bg: "#f1f5f9", color: "#475569" };
  return {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    background: c.bg,
    color: c.color,
  };
}

export default function Protocolos({ usuario }) {
  const [protocolos, setProtocolos] = useState([]);
  const [statusLista, setStatusLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [documentos, setDocumentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const isUsuario = usuario?.tipo_usuario === "USUARIO";
  const podeMovimentar =
    usuario?.tipo_usuario === "OPERADOR" || usuario?.tipo_usuario === "ADMIN";
  const podeExcluir = usuario?.tipo_usuario === "ADMIN";
  const idFiltro = isUsuario ? usuario.id_usuario : null;

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [lista, status] = await Promise.all([
        api.getProtocolos(idFiltro),
        api.getStatusProtocolo(),
      ]);
      setProtocolos(lista);
      setStatusLista(status);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [idFiltro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    return protocolos.filter((p) => {
      const buscaOk =
        !busca ||
        p.codigo_protocolo.toLowerCase().includes(busca.toLowerCase()) ||
        (p.nome_usuario || "").toLowerCase().includes(busca.toLowerCase());
      const statusOk = filtroStatus === "Todos" || p.nome_status === filtroStatus;
      return buscaOk && statusOk;
    });
  }, [protocolos, busca, filtroStatus]);

  const abrirVisualizar = async (item) => {
    setSucesso("");
    setForm({ ...item });
    try {
      const [detalhe, hist] = await Promise.all([
        api.getProtocolo(item.id_protocolo),
        api.getHistoricoProtocolo(item.id_protocolo),
      ]);
      setForm(detalhe);
      setDocumentos(detalhe.documentos || []);
      setHistorico(hist);
    } catch {
      setDocumentos([]);
      setHistorico([]);
    }
    setModal("visualizar");
  };

  const abrirMovimentar = (item) => {
    setForm({
      id_protocolo: item.id_protocolo,
      codigo_protocolo: item.codigo_protocolo,
      nome_status: item.nome_status,
      id_status: item.id_status,
      descricao: "",
    });
    setModal("movimentar");
  };

  const salvarMovimentacao = async () => {
    setSalvando(true);
    setErro("");
    try {
      await api.movimentarProtocolo(form.id_protocolo, {
        id_status: form.id_status,
        id_usuario: usuario.id_usuario,
        descricao: form.descricao?.trim() || null,
      });
      setModal(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const reenviar = async (item) => {
    if (
      !window.confirm(
        "Confirma o reenvio do protocolo após as correções? Ele voltará para análise."
      )
    ) {
      return;
    }
    setErro("");
    try {
      await api.reenviarProtocolo(item.id_protocolo, usuario.id_usuario);
      setSucesso(`Protocolo ${item.codigo_protocolo} reenviado para análise.`);
      if (modal === "visualizar") setModal(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  };

  const excluir = async (item) => {
    if (!window.confirm(`Excluir protocolo ${item.codigo_protocolo}?`)) return;
    try {
      await api.deleteProtocolo(item.id_protocolo, usuario.id_usuario);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  };

  const podeReenviar = (item) =>
    isUsuario && item.nome_status === "Pendente" && item.id_usuario === usuario.id_usuario;

  return (
    <section style={s.page}>
      <div style={s.topo}>
        <div>
          <h2 style={s.titulo}>Protocolos</h2>
          <p style={s.subtitulo}>
            {isUsuario
              ? "Acompanhe o andamento dos seus envios. Corrija documentos quando o status estiver Pendente."
              : "Valide e movimente os protocolos gerados pelos envios de documentos."}
          </p>
        </div>
      </div>

      <div style={s.filtrosArea}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Buscar</label>
          <input
            style={s.input}
            placeholder="Código ou usuário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Status</label>
          <select
            style={s.select}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option>Todos</option>
            {statusLista.map((st) => (
              <option key={st.id_status} value={st.nome_status}>
                {st.nome_status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p style={s.erro}>{erro}</p>}
      {sucesso && <p style={s.sucesso}>{sucesso}</p>}

      <div style={s.tabelaBox}>
        {carregando ? (
          <p style={s.carregando}>Carregando protocolos...</p>
        ) : (
          <>
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>Código</th>
                  {!isUsuario && <th style={s.th}>Usuário</th>}
                  <th style={s.th}>Documentos</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Data</th>
                  <th style={s.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.slice(0, TABLE_LIMIT).map((item) => (
                  <tr key={item.id_protocolo}>
                    <td style={s.td}>{item.codigo_protocolo}</td>
                    {!isUsuario && <td style={s.td}>{item.nome_usuario}</td>}
                    <td style={s.td}>{item.qtd_documentos || 0}</td>
                    <td style={s.td}>
                      <span style={statusBadgeStyle(item.nome_status)}>
                        {item.nome_status}
                      </span>
                    </td>
                    <td style={s.td}>{formatarData(item.data_criacao)}</td>
                    <td style={s.td}>
                      <div style={s.acoes}>
                        <IconButton
                          title="Ver detalhes"
                          onClick={() => abrirVisualizar(item)}
                        >
                          <IconVer />
                        </IconButton>
                        {podeReenviar(item) && (
                          <IconButton
                            title="Reenviar para análise"
                            variant="primary"
                            onClick={() => reenviar(item)}
                          >
                            <IconReenviar />
                          </IconButton>
                        )}
                        {podeMovimentar && (
                          <IconButton
                            title="Movimentar protocolo"
                            variant="warning"
                            onClick={() => abrirMovimentar(item)}
                          >
                            <IconMovimentar />
                          </IconButton>
                        )}
                        {podeExcluir && (
                          <IconButton
                            title="Excluir protocolo"
                            variant="danger"
                            onClick={() => excluir(item)}
                          >
                            <IconExcluir />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <p style={s.vazio}>
                {isUsuario
                  ? 'Nenhum protocolo encontrado. Envie documentos em "Documentos" para gerar um protocolo.'
                  : "Nenhum protocolo encontrado."}
              </p>
            )}
          </>
        )}
      </div>

      {modal === "movimentar" && (
        <Modal titulo="Movimentar Protocolo" onFechar={() => setModal(null)}>
          <p style={{ color: "var(--text)", marginTop: 0 }}>
            <strong>{form.codigo_protocolo}</strong> — Status atual:{" "}
            <span style={statusBadgeStyle(form.nome_status)}>{form.nome_status}</span>
          </p>
          <div style={s.formGrupo}>
            <label style={s.label}>Novo status</label>
            <select
              style={s.select}
              value={form.id_status}
              onChange={(e) =>
                setForm({ ...form, id_status: Number(e.target.value) })
              }
            >
              {statusLista.map((st) => (
                <option key={st.id_status} value={st.id_status}>
                  {st.nome_status}
                </option>
              ))}
            </select>
          </div>
          <div style={s.formGrupo}>
            <label style={s.label}>Descrição para o usuário (opcional)</label>
            <textarea
              style={s.textarea}
              value={form.descricao || ""}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex.: Documento ilegível, enviar novamente o RG..."
              rows={3}
            />
          </div>
          <p style={{ color: "var(--text)", fontSize: "13px", opacity: 0.7 }}>
            Use &quot;Pendente&quot; quando o usuário precisar corrigir documentos. A descrição
            ficará visível no histórico do protocolo.
          </p>
          <div style={s.formAcoes}>
            <button type="button" style={s.btnSecundario} onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button
              type="button"
              style={s.btnPrimario}
              onClick={salvarMovimentacao}
              disabled={salvando}
            >
              {salvando ? "Movimentando..." : "Confirmar Movimentação"}
            </button>
          </div>
        </Modal>
      )}

      {modal === "visualizar" && (
        <Modal titulo="Detalhes do Protocolo" onFechar={() => setModal(null)} largura={640}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <p style={{ color: "var(--text)", margin: 0 }}>
              <strong>Código:</strong> {form.codigo_protocolo}
            </p>
            <p style={{ color: "var(--text)", margin: 0 }}>
              <strong>Status:</strong>{" "}
              <span style={statusBadgeStyle(form.nome_status)}>{form.nome_status}</span>
            </p>
            <p style={{ color: "var(--text)", margin: 0 }}>
              <strong>Usuário:</strong> {form.nome_usuario}
            </p>
            <p style={{ color: "var(--text)", margin: 0 }}>
              <strong>E-mail:</strong> {form.email_usuario}
            </p>
            <p style={{ color: "var(--text)", margin: 0 }}>
              <strong>CPF:</strong> {form.cpf_usuario || "-"}
            </p>
            <p style={{ color: "var(--text)", margin: 0 }}>
              <strong>Data:</strong> {formatarData(form.data_criacao)}
            </p>
          </div>
          {form.descricao && (
            <p style={{ color: "var(--text)", marginTop: "12px" }}>
              <strong>Observações:</strong> {form.descricao}
            </p>
          )}

          <h4 style={{ color: "var(--text)", marginTop: "20px" }}>Documentos Enviados</h4>
          {documentos.length === 0 ? (
            <p style={{ opacity: 0.7, color: "var(--text)" }}>Nenhum documento vinculado.</p>
          ) : (
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>Arquivo</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Formato</th>
                  <th style={s.th}>Validade</th>
                </tr>
              </thead>
              <tbody>
                {documentos.slice(0, TABLE_LIMIT).map((d) => (
                  <tr key={d.id_documento}>
                    <td style={s.td}>
                      {d.caminho_arquivo ? (
                        <a
                          href={api.urlArquivoDocumento(d.id_documento)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#2563eb" }}
                        >
                          {d.nome_arquivo}
                        </a>
                      ) : (
                        d.nome_arquivo
                      )}
                    </td>
                    <td style={s.td}>{d.nome_tipo}</td>
                    <td style={s.td}>{d.tipo_arquivo?.toUpperCase()}</td>
                    <td style={s.td}>{formatarData(d.validade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {form.nome_status === "Pendente" && isUsuario && (
            <div
              style={{
                background: "#fef3c7",
                borderRadius: "10px",
                padding: "12px",
                marginTop: "16px",
                fontSize: "14px",
                color: "#92400e",
              }}
            >
              Seu protocolo está <strong>Pendente</strong>. Corrija os documentos na página
              Documentos e clique em <strong>Reenviar</strong> quando terminar.
              {historico[0]?.descricao && historico[0]?.status_novo === "Pendente" && (
                <p style={{ margin: "10px 0 0", paddingTop: "10px", borderTop: "1px solid #fde68a" }}>
                  <strong>Mensagem do operador:</strong> {historico[0].descricao}
                </p>
              )}
            </div>
          )}

          <h4 style={{ color: "var(--text)", marginTop: "20px" }}>Histórico de Movimentação</h4>
          {historico.length === 0 ? (
            <p style={{ opacity: 0.7, color: "var(--text)" }}>Sem movimentações registradas.</p>
          ) : (
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>De</th>
                  <th style={s.th}>Para</th>
                  <th style={s.th}>Responsável</th>
                  <th style={s.th}>Descrição</th>
                  <th style={s.th}>Data</th>
                </tr>
              </thead>
              <tbody>
                {historico.slice(0, TABLE_LIMIT).map((h) => (
                  <tr key={h.id_movimentacao}>
                    <td style={s.td}>{h.status_anterior || "-"}</td>
                    <td style={s.td}>{h.status_novo}</td>
                    <td style={s.td}>{h.nome_usuario}</td>
                    <td style={s.td}>{h.descricao || "—"}</td>
                    <td style={s.td}>{formatarData(h.data_hora)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {podeReenviar(form) && (
            <div style={{ ...s.formAcoes, marginTop: "16px" }}>
              <button
                type="button"
                style={s.btnPrimario}
                onClick={() => reenviar(form)}
              >
                Reenviar para Análise
              </button>
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}
