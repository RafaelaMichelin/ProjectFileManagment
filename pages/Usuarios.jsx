import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import IconButton, { IconVer, IconEditar, IconExcluir } from "../components/IconButton";
import { pageStyles as s } from "../components/pageStyles";
import { api } from "../services/api";
import { formatarData } from "../utils/date";
import { TABLE_LIMIT } from "../utils/table";

const TIPOS_USUARIO = ["ADMIN", "OPERADOR", "USUARIO"];

export default function Usuarios({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);

  const isAdmin = usuario?.tipo_usuario === "ADMIN";

  const carregar = useCallback(async () => {
    if (!isAdmin) return;
    setCarregando(true);
    setErro("");
    try {
      const lista = await api.getUsuarios();
      setUsuarios(lista);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const buscaOk =
        !busca ||
        u.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase());
      const tipoOk = filtroTipo === "Todos" || u.tipo_usuario === filtroTipo;
      return buscaOk && tipoOk;
    });
  }, [usuarios, busca, filtroTipo]);

  const abrirNovo = () => {
    setForm({
      nome_completo: "",
      email: "",
      senha: "",
      tipo_usuario: "USUARIO",
    });
    setModal("novo");
  };

  const abrirVisualizar = (item) => {
    setForm({ ...item });
    setModal("visualizar");
  };

  const abrirEditar = (item) => {
    setForm({
      id_usuario: item.id_usuario,
      nome_completo: item.nome_completo,
      email: item.email,
      senha: "",
      tipo_usuario: item.tipo_usuario,
    });
    setModal("editar");
  };

  const salvarNovo = async () => {
    setSalvando(true);
    setErro("");
    try {
      await api.createUsuario({
        ...form,
        id_usuario: usuario.id_usuario,
      });
      setModal(null);
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
      const dados = {
        nome_completo: form.nome_completo,
        email: form.email,
        tipo_usuario: form.tipo_usuario,
        id_usuario: usuario.id_usuario,
      };
      if (form.senha) dados.senha = form.senha;
      await api.updateUsuario(form.id_usuario, dados);
      setModal(null);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (item) => {
    if (item.id_usuario === usuario.id_usuario) {
      setErro("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (!window.confirm(`Excluir usuário ${item.nome_completo}?`)) return;
    try {
      await api.deleteUsuario(item.id_usuario, usuario.id_usuario);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  };

  if (!isAdmin) {
    return (
      <section style={s.page}>
        <h2 style={s.titulo}>Usuários</h2>
        <p style={s.subtitulo}>Acesso restrito a administradores.</p>
      </section>
    );
  }

  const formulario = (modo) => (
    <>
      <div style={s.formGrupo}>
        <label style={s.label}>Nome completo</label>
        <input
          style={s.input}
          value={form.nome_completo}
          onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
        />
      </div>
      <div style={s.formGrupo}>
        <label style={s.label}>E-mail</label>
        <input
          type="email"
          style={s.input}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div style={s.formGrupo}>
        <label style={s.label}>
          Senha {modo === "editar" && "(deixe em branco para manter)"}
        </label>
        <input
          type="password"
          style={s.input}
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
        />
      </div>
      <div style={s.formGrupo}>
        <label style={s.label}>Tipo de usuário</label>
        <select
          style={s.select}
          value={form.tipo_usuario}
          onChange={(e) => setForm({ ...form, tipo_usuario: e.target.value })}
        >
          {TIPOS_USUARIO.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div style={s.formAcoes}>
        <button type="button" style={s.btnSecundario} onClick={() => setModal(null)}>
          Cancelar
        </button>
        <button
          type="button"
          style={s.btnPrimario}
          onClick={modo === "novo" ? salvarNovo : salvarEdicao}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : modo === "novo" ? "Criar Usuário" : "Salvar"}
        </button>
      </div>
    </>
  );

  return (
    <section style={s.page}>
      <div style={s.topo}>
        <div>
          <h2 style={s.titulo}>Usuários</h2>
          <p style={s.subtitulo}>Gerencie usuários, operadores e administradores.</p>
        </div>
        <button type="button" style={s.btnPrimario} onClick={abrirNovo}>
          + Novo Usuário
        </button>
      </div>

      <div style={s.filtrosArea}>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Buscar</label>
          <input
            style={s.input}
            placeholder="Nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div style={s.filtroGrupo}>
          <label style={s.label}>Tipo</label>
          <select
            style={s.select}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option>Todos</option>
            {TIPOS_USUARIO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p style={s.erro}>{erro}</p>}

      <div style={s.tabelaBox}>
        {carregando ? (
          <p style={s.carregando}>Carregando usuários...</p>
        ) : (
          <>
            <table style={s.tabela}>
              <thead>
                <tr>
                  <th style={s.th}>Nome</th>
                  <th style={s.th}>E-mail</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Cadastro</th>
                  <th style={s.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.slice(0, TABLE_LIMIT).map((item) => (
                  <tr key={item.id_usuario}>
                    <td style={s.td}>{item.nome_completo}</td>
                    <td style={s.td}>{item.email}</td>
                    <td style={s.td}>{item.tipo_usuario}</td>
                    <td style={s.td}>{formatarData(item.created_at)}</td>
                    <td style={s.td}>
                      <div style={s.acoes}>
                        <IconButton
                          title="Ver detalhes"
                          onClick={() => abrirVisualizar(item)}
                        >
                          <IconVer />
                        </IconButton>
                        <IconButton
                          title="Editar usuário"
                          variant="warning"
                          onClick={() => abrirEditar(item)}
                        >
                          <IconEditar />
                        </IconButton>
                        <IconButton
                          title="Excluir usuário"
                          variant="danger"
                          onClick={() => excluir(item)}
                        >
                          <IconExcluir />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <p style={s.vazio}>Nenhum usuário encontrado.</p>
            )}
          </>
        )}
      </div>

      {modal === "novo" && (
        <Modal titulo="Novo Usuário" onFechar={() => setModal(null)}>
          {formulario("novo")}
        </Modal>
      )}

      {modal === "editar" && (
        <Modal titulo="Editar Usuário" onFechar={() => setModal(null)}>
          {formulario("editar")}
        </Modal>
      )}

      {modal === "visualizar" && (
        <Modal titulo="Detalhes do Usuário" onFechar={() => setModal(null)}>
          <p style={{ color: "var(--text)" }}>
            <strong>Nome:</strong> {form.nome_completo}
          </p>
          <p style={{ color: "var(--text)" }}>
            <strong>E-mail:</strong> {form.email}
          </p>
          <p style={{ color: "var(--text)" }}>
            <strong>Tipo:</strong> {form.tipo_usuario}
          </p>
          <p style={{ color: "var(--text)" }}>
            <strong>Cadastro:</strong> {formatarData(form.created_at)}
          </p>
        </Modal>
      )}
    </section>
  );
}
