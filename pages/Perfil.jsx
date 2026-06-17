import { useCallback, useEffect, useState } from "react";
import { pageStyles as s } from "../components/pageStyles";
import { api } from "../services/api";
import { formatarData } from "../utils/date";

const TIPO_LABEL = {
  ADMIN: "Administrador",
  OPERADOR: "Operador",
  USUARIO: "Usuário",
};

export default function Perfil({ usuario, onUsuarioUpdate }) {
  const [dados, setDados] = useState(null);
  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    senha: "",
    confirmar_senha: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregar = useCallback(async () => {
    if (!usuario?.id_usuario) return;
    setCarregando(true);
    setErro("");
    try {
      const perfil = await api.getUsuario(usuario.id_usuario);
      setDados(perfil);
      setForm({
        nome_completo: perfil.nome_completo,
        email: perfil.email,
        senha: "",
        confirmar_senha: "",
      });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario?.id_usuario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nome_completo.trim() || !form.email.trim()) {
      setErro("Nome e e-mail são obrigatórios.");
      return;
    }

    if (form.senha && form.senha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (form.senha && form.senha !== form.confirmar_senha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome_completo: form.nome_completo.trim(),
        email: form.email.trim(),
        tipo_usuario: dados.tipo_usuario,
        id_usuario: usuario.id_usuario,
      };
      if (form.senha) payload.senha = form.senha;

      await api.updateUsuario(usuario.id_usuario, payload);

      const atualizado = {
        nome_completo: form.nome_completo.trim(),
        email: form.email.trim(),
      };
      setDados((prev) => ({ ...prev, ...atualizado }));
      onUsuarioUpdate?.(atualizado);
      setForm((prev) => ({ ...prev, senha: "", confirmar_senha: "" }));
      setSucesso("Perfil atualizado com sucesso.");
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <section style={s.page}>
        <p style={s.carregando}>Carregando perfil...</p>
      </section>
    );
  }

  if (!dados) {
    return (
      <section style={s.page}>
        <p style={s.erro}>{erro || "Não foi possível carregar o perfil."}</p>
      </section>
    );
  }

  return (
    <section style={s.page}>
      <div style={s.topo}>
        <div>
          <h2 style={s.titulo}>Meu perfil</h2>
          <p style={s.subtitulo}>Gerencie suas informações pessoais e senha de acesso.</p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.infoCard}>
          <h3 style={styles.secaoTitulo}>Informações da conta</h3>
          <dl style={styles.infoLista}>
            <div style={styles.infoItem}>
              <dt style={styles.infoLabel}>Tipo de usuário</dt>
              <dd style={styles.infoValor}>{TIPO_LABEL[dados.tipo_usuario] || dados.tipo_usuario}</dd>
            </div>
            <div style={styles.infoItem}>
              <dt style={styles.infoLabel}>Membro desde</dt>
              <dd style={styles.infoValor}>{formatarData(dados.created_at)}</dd>
            </div>
          </dl>
        </div>

        <form style={styles.formCard} onSubmit={handleSalvar}>
          <h3 style={styles.secaoTitulo}>Dados pessoais</h3>

          <div style={s.formGrupo}>
            <label style={s.label} htmlFor="perfil-nome">
              Nome completo
            </label>
            <input
              id="perfil-nome"
              style={s.input}
              value={form.nome_completo}
              onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
              required
            />
          </div>

          <div style={s.formGrupo}>
            <label style={s.label} htmlFor="perfil-email">
              E-mail
            </label>
            <input
              id="perfil-email"
              type="email"
              style={s.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <h3 style={{ ...styles.secaoTitulo, marginTop: "8px" }}>Alterar senha</h3>
          <p style={styles.dicaSenha}>Deixe em branco para manter a senha atual.</p>

          <div style={s.formGrupo}>
            <label style={s.label} htmlFor="perfil-senha">
              Nova senha
            </label>
            <input
              id="perfil-senha"
              type="password"
              style={s.input}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <div style={s.formGrupo}>
            <label style={s.label} htmlFor="perfil-confirmar">
              Confirmar nova senha
            </label>
            <input
              id="perfil-confirmar"
              type="password"
              style={s.input}
              value={form.confirmar_senha}
              onChange={(e) => setForm({ ...form, confirmar_senha: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          {erro && <p style={s.erro}>{erro}</p>}
          {sucesso && <p style={s.sucesso}>{sucesso}</p>}

          <div style={s.formAcoes}>
            <button
              type="button"
              style={s.btnSecundario}
              onClick={carregar}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" style={s.btnPrimario} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  infoCard: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  formCard: {
    background: "var(--bg)",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  secaoTitulo: {
    margin: "0 0 18px",
    fontSize: "18px",
    color: "var(--text)",
  },
  infoLista: {
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "13px",
    color: "var(--text)",
    opacity: 0.65,
  },
  infoValor: {
    margin: 0,
    fontSize: "15px",
    color: "var(--text)",
    fontWeight: 500,
  },
  dicaSenha: {
    margin: "0 0 14px",
    fontSize: "13px",
    color: "var(--text)",
    opacity: 0.65,
  },
};
