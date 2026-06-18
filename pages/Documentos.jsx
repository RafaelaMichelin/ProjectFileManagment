import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import IconButton, { IconEditar, IconExcluir, IconDownload } from "../components/IconButton";
import { pageStyles as s } from "../components/pageStyles";
import { api } from "../services/api";
import { formatarData } from "../utils/date";

const DOC_VAZIO = {
  arquivo: null,
  nome_arquivo: "",
  tipo_arquivo: "",
  id_tipo_documento: "",
  validade: "",
};

const ACEITOS = ".pdf,.jpg,.jpeg,.png";

function tipoDoArquivo(nome) {
  const ext = nome.split(".").pop()?.toLowerCase();
  if (ext === "jpeg") return "jpg";
  if (["pdf", "jpg", "png"].includes(ext)) return ext;
  return "";
}

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
    whiteSpace: "nowrap",
  };
}

export default function Documentos({ usuario }) {
  const [documentos, setDocumentos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [envioForm, setEnvioForm] = useState({ descricao: "", documentos: [] });
  const [salvando, setSalvando] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState(null);

  const isUsuario = usuario?.tipo_usuario === "USUARIO";
  const idFiltro = isUsuario ? usuario.id_usuario : null;

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [docs, tiposDoc] = await Promise.all([
        api.getDocumentos(idFiltro),
        api.getTiposDocumento(),
      ]);
      setDocumentos(docs);
      setTipos(tiposDoc);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [idFiltro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const statusDisponiveis = useMemo(() => {
    return [...new Set(documentos.map((d) => d.status_protocolo))].sort();
  }, [documentos]);

  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      const buscaOk =
        !busca ||
        d.nome_arquivo.toLowerCase().includes(busca.toLowerCase()) ||
        d.codigo_protocolo.toLowerCase().includes(busca.toLowerCase());
      const statusOk =
        filtroStatus === "Todos" || d.status_protocolo === filtroStatus;
      return buscaOk && statusOk;
    });
  }, [documentos, busca, filtroStatus]);

  const podeEditar = (item) => {
    if (usuario?.tipo_usuario === "ADMIN" || usuario?.tipo_usuario === "OPERADOR") {
      return true;
    }
    return item.status_protocolo === "Pendente" && item.id_usuario === usuario?.id_usuario;
  };

  const abrirEnvio = () => {
    setEnvioForm({
      descricao: "",
      documentos: [
        {
          ...DOC_VAZIO,
          id_tipo_documento: tipos[0]?.id_tipo_documento || "",
        },
      ],
    });
    setProtocoloGerado(null);
    setSucesso("");
    setModal("envio");
  };

  const abrirEditar = (item) => {
    setForm({
      id_documento: item.id_documento,
      nome_arquivo: item.nome_arquivo,
      tipo_arquivo: item.tipo_arquivo,
      validade: item.validade ? item.validade.slice(0, 10) : "",
      id_tipo_documento: item.id_tipo_documento,
      codigo_protocolo: item.codigo_protocolo,
      status_protocolo: item.status_protocolo,
      caminho_arquivo: item.caminho_arquivo,
      arquivo: null,
    });
    setModal("editar");
  };

  const selecionarArquivo = (index, file) => {
    if (!file) return;
    const tipo = tipoDoArquivo(file.name);
    if (!tipo) {
      setErro("Formato não permitido. Use PDF, JPG ou PNG.");
      return;
    }
    setErro("");
    setEnvioForm((prev) => {
      const docs = [...prev.documentos];
      docs[index] = {
        ...docs[index],
        arquivo: file,
        nome_arquivo: file.name,
        tipo_arquivo: tipo,
      };
      return { ...prev, documentos: docs };
    });
  };

  const selecionarArquivoEdicao = (file) => {
    if (!file) return;
    const tipo = tipoDoArquivo(file.name);
    if (!tipo) {
      setErro("Formato não permitido. Use PDF, JPG ou PNG.");
      return;
    }
    setErro("");
    setForm((prev) => ({
      ...prev,
      arquivo: file,
      nome_arquivo: file.name,
      tipo_arquivo: tipo,
    }));
  };

  const atualizarDocEnvio = (index, campo, valor) => {
    setEnvioForm((prev) => {
      const docs = [...prev.documentos];
      docs[index] = { ...docs[index], [campo]: valor };
      return { ...prev, documentos: docs };
    });
  };

  const adicionarLinhaDoc = () => {
    setEnvioForm((prev) => ({
      ...prev,
      documentos: [
        ...prev.documentos,
        { ...DOC_VAZIO, id_tipo_documento: tipos[0]?.id_tipo_documento || "" },
      ],
    }));
  };

  const removerLinhaDoc = (index) => {
    setEnvioForm((prev) => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index),
    }));
  };

  const salvarEnvio = async () => {
    const semArquivo = envioForm.documentos.some((d) => !d.arquivo);
    if (semArquivo) {
      setErro("Selecione um arquivo do seu computador para cada documento.");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const formData = new FormData();
      formData.append("id_usuario", usuario.id_usuario);
      formData.append("descricao", envioForm.descricao);
      formData.append(
        "metadados",
        JSON.stringify(
          envioForm.documentos.map((d) => ({
            id_tipo_documento: Number(d.id_tipo_documento),
            validade: d.validade || null,
          }))
        )
      );
      envioForm.documentos.forEach((d) => {
        formData.append("arquivos", d.arquivo);
      });

      const resultado = await api.enviarDocumentos(formData);
      setProtocoloGerado(resultado.protocolo);
      setSucesso(resultado.message);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicao = async () => {
    setSalvando(true);
    setErro("");
    try {
      const formData = new FormData();
      formData.append("id_usuario", usuario.id_usuario);
      formData.append("tipo_usuario", usuario.tipo_usuario);
      formData.append("validade", form.validade || "");
      formData.append("id_tipo_documento", form.id_tipo_documento);
      if (form.arquivo) {
        formData.append("arquivo", form.arquivo);
      }

      await api.updateDocumento(form.id_documento, formData);
      setModal(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (item) => {
    if (!window.confirm(`Excluir documento "${item.nome_arquivo}"?`)) return;
    try {
      await api.deleteDocumento(item.id_documento, usuario.id_usuario, usuario.tipo_usuario);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  };

  return (
    <section style={s.page}>
      <div style={s.topo}>
        <div>
          <h2 style={s.titulo}>Envio de Documentos</h2>
          <p style={s.subtitulo}>
            Ao enviar seus documentos, um protocolo é gerado automaticamente para acompanhamento.
          </p>
        </div>
        <button type="button" style={s.btnPrimario} onClick={abrirEnvio}>
          + Enviar Documentos
        </button>
      </div>

      <div style={s.filtrosArea}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Buscar</label>
          <input
            style={s.input}
            placeholder="Arquivo ou protocolo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Status do protocolo</label>
          <select
            style={s.select}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option>Todos</option>
            {statusDisponiveis.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

      <div style={s.tabelaBox}>
        {carregando ? (
          <p style={s.carregando}>Carregando documentos...</p>
        ) : (
          <>
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>Protocolo</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Arquivo</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Formato</th>
                  <th style={s.th}>Envio</th>
                  <th style={s.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => (
                  <tr key={item.id_documento}>
                    <td style={s.td}>{item.codigo_protocolo}</td>
                    <td style={s.td}>
                      <span style={statusBadgeStyle(item.status_protocolo)}>
                        {item.status_protocolo}
                      </span>
                    </td>
                    <td style={s.td}>
                      {item.caminho_arquivo ? (
                        <a
                          href={api.urlArquivoDocumento(item.id_documento)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#2563eb", textDecoration: "none" }}
                        >
                          {item.nome_arquivo}
                        </a>
                      ) : (
                        item.nome_arquivo
                      )}
                    </td>
                    <td style={s.td}>{item.nome_tipo}</td>
                    <td style={s.td}>{item.tipo_arquivo.toUpperCase()}</td>
                    <td style={s.td}>{formatarData(item.data_envio)}</td>
                    <td style={s.td}>
                      <div style={s.acoes}>
                        {item.caminho_arquivo && (
                          <IconButton
                            title="Abrir arquivo"
                            variant="primary"
                            onClick={() =>
                              window.open(api.urlArquivoDocumento(item.id_documento), "_blank")
                            }
                          >
                            <IconDownload />
                          </IconButton>
                        )}
                        {podeEditar(item) && (
                          <>
                            <IconButton
                              title="Corrigir documento"
                              variant="warning"
                              onClick={() => abrirEditar(item)}
                            >
                              <IconEditar />
                            </IconButton>
                            <IconButton
                              title="Excluir documento"
                              variant="danger"
                              onClick={() => excluir(item)}
                            >
                              <IconExcluir />
                            </IconButton>
                          </>
                        )}
                        {!podeEditar(item) && (
                          <span style={{ fontSize: "12px", opacity: 0.6 }} title="Documento em análise">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <p style={s.vazio}>
                Nenhum documento enviado. Clique em &quot;Enviar Documentos&quot; para gerar seu
                primeiro protocolo.
              </p>
            )}
          </>
        )}
      </div>

      {modal === "envio" && (
        <Modal titulo="Enviar Documentos" onFechar={() => setModal(null)} largura={620}>
          {protocoloGerado ? (
            <div>
              <p style={s.sucesso}>{sucesso}</p>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ color: "var(--text)", margin: "0 0 8px" }}>
                  <strong>Protocolo gerado:</strong> {protocoloGerado.codigo_protocolo}
                </p>
                <p style={{ color: "var(--text)", margin: 0 }}>
                  <strong>Status:</strong>{" "}
                  <span style={statusBadgeStyle(protocoloGerado.nome_status)}>
                    {protocoloGerado.nome_status}
                  </span>
                </p>
              </div>
              <p style={{ color: "var(--text)", opacity: 0.8, fontSize: "14px" }}>
                Acompanhe o andamento na página <strong>Protocolos</strong>.
              </p>
              <div style={s.formAcoes}>
                <button type="button" style={s.btnPrimario} onClick={() => setModal(null)}>
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={s.formGrupo}>
                <label style={s.label}>Observações</label>
                <textarea
                  style={s.textarea}
                  value={envioForm.descricao}
                  onChange={(e) =>
                    setEnvioForm({ ...envioForm, descricao: e.target.value })
                  }
                  placeholder="Informações adicionais sobre o envio..."
                />
              </div>

              <h4 style={{ color: "var(--text)", margin: "16px 0 10px" }}>Documentos</h4>

              {envioForm.documentos.map((doc, index) => (
                <div
                  key={index}
                  style={{
                    background: "var(--bg)",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ color: "var(--text)" }}>Documento {index + 1}</strong>
                    {envioForm.documentos.length > 1 && (
                      <button
                        type="button"
                        style={{ ...s.btnPerigo, padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => removerLinhaDoc(index)}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div style={s.formGrupo}>
                    <label style={s.label}>Arquivo do computador</label>
                    <input
                      type="file"
                      accept={ACEITOS}
                      style={s.input}
                      onChange={(e) => {
                        selecionarArquivo(index, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    {doc.nome_arquivo && (
                      <span style={{ fontSize: "13px", color: "var(--text)", opacity: 0.8 }}>
                        Selecionado: <strong>{doc.nome_arquivo}</strong>
                        {doc.tipo_arquivo && ` (${doc.tipo_arquivo.toUpperCase()})`}
                      </span>
                    )}
                  </div>
                  <div style={s.formGrupo}>
                    <label style={s.label}>Tipo de documento</label>
                    <select
                      style={s.select}
                      value={doc.id_tipo_documento}
                      onChange={(e) =>
                        atualizarDocEnvio(index, "id_tipo_documento", e.target.value)
                      }
                    >
                      {tipos.map((t) => (
                        <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                          {t.nome_tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={s.formGrupo}>
                    <label style={s.label}>Validade (opcional)</label>
                    <input
                      type="date"
                      style={s.input}
                      value={doc.validade}
                      onChange={(e) => atualizarDocEnvio(index, "validade", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button type="button" style={s.btnSecundario} onClick={adicionarLinhaDoc}>
                + Adicionar outro documento
              </button>

              {erro && <p style={s.erro}>{erro}</p>}

              <div style={s.formAcoes}>
                <button type="button" style={s.btnSecundario} onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  style={s.btnPrimario}
                  onClick={salvarEnvio}
                  disabled={salvando}
                >
                  {salvando ? "Enviando..." : "Enviar e Gerar Protocolo"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {modal === "editar" && (
        <Modal titulo="Corrigir Documento" onFechar={() => setModal(null)}>
          <p style={{ color: "var(--text)", fontSize: "14px", opacity: 0.8 }}>
            Protocolo <strong>{form.codigo_protocolo}</strong> — Status:{" "}
            <span style={statusBadgeStyle(form.status_protocolo)}>
              {form.status_protocolo}
            </span>
          </p>
          <div style={s.formGrupo}>
            <label style={s.label}>Arquivo atual</label>
            <p style={{ color: "var(--text)", margin: "0 0 8px", fontSize: "14px" }}>
              {form.caminho_arquivo ? (
                <a
                  href={api.urlArquivoDocumento(form.id_documento)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {form.nome_arquivo}
                </a>
              ) : (
                form.nome_arquivo
              )}
            </p>
          </div>
          <div style={s.formGrupo}>
            <label style={s.label}>Substituir arquivo (opcional)</label>
            <input
              type="file"
              accept={ACEITOS}
              style={s.input}
              onChange={(e) => {
                selecionarArquivoEdicao(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {form.arquivo && (
              <span style={{ fontSize: "13px", color: "var(--text)", opacity: 0.8 }}>
                Novo arquivo: <strong>{form.arquivo.name}</strong>
              </span>
            )}
          </div>
          <div style={s.formGrupo}>
            <label style={s.label}>Tipo de documento</label>
            <select
              style={s.select}
              value={form.id_tipo_documento}
              onChange={(e) =>
                setForm({ ...form, id_tipo_documento: Number(e.target.value) })
              }
            >
              {tipos.map((t) => (
                <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                  {t.nome_tipo}
                </option>
              ))}
            </select>
          </div>
          <div style={s.formGrupo}>
            <label style={s.label}>Validade</label>
            <input
              type="date"
              style={s.input}
              value={form.validade}
              onChange={(e) => setForm({ ...form, validade: e.target.value })}
            />
          </div>
          <div style={s.formAcoes}>
            <button type="button" style={s.btnSecundario} onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button
              type="button"
              style={s.btnPrimario}
              onClick={salvarEdicao}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar Correção"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
