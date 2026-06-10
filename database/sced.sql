-- =========================================
-- CRIAÇÃO DO BANCO
-- =========================================

CREATE DATABASE IF NOT EXISTS sced;
USE sced;

-- =========================================
-- TABELA USUÁRIOS
-- =========================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ADMIN', 'OPERADOR', 'USUARIO') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABELA STATUS
-- =========================================

CREATE TABLE status_protocolo (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    nome_status VARCHAR(50) NOT NULL,
    descricao TEXT
);

-- =========================================
-- INSERT STATUS PADRÃO
-- =========================================

INSERT INTO status_protocolo (nome_status, descricao) VALUES
('Recebido', 'Protocolo gerado'),
('Pendente', 'Aguardando documentos obrigatórios'),
('Em análise', 'Documentos recebidos e em validação'),
('Encaminhado', 'Documentos encaminhados'),
('Finalizado', 'Processo concluído');

-- =========================================
-- TABELA PROTOCOLOS
-- =========================================

CREATE TABLE protocolos (
    id_protocolo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_protocolo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    cpf_usuario VARCHAR(14),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT NOT NULL,
    id_status INT NOT NULL,

    CONSTRAINT fk_protocolo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_protocolo_status
        FOREIGN KEY (id_status)
        REFERENCES status_protocolo(id_status)
);

-- =========================================
-- TABELA TIPOS DOCUMENTO
-- =========================================

CREATE TABLE tipos_documento (
    id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- =========================================
-- TABELA DOCUMENTOS
-- =========================================

CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,

    tipo_arquivo ENUM('pdf', 'jpg', 'png') NOT NULL,

    validade DATE,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_protocolo INT NOT NULL,
    id_tipo_documento INT NOT NULL,

    CONSTRAINT fk_documento_protocolo
        FOREIGN KEY (id_protocolo)
        REFERENCES protocolos(id_protocolo),

    CONSTRAINT fk_documento_tipo
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipos_documento(id_tipo_documento)
);

-- =========================================
-- TABELA HISTÓRICO MOVIMENTAÇÃO
-- =========================================

CREATE TABLE historico_movimentacao (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,

    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),

    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_protocolo INT NOT NULL,
    id_usuario INT NOT NULL,

    CONSTRAINT fk_historico_protocolo
        FOREIGN KEY (id_protocolo)
        REFERENCES protocolos(id_protocolo),

    CONSTRAINT fk_historico_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);

-- =========================================
-- TABELA LOGS SISTEMA
-- =========================================

CREATE TABLE logs_sistema (
    id_log INT AUTO_INCREMENT PRIMARY KEY,

    acao VARCHAR(255),
    data_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT,

    CONSTRAINT fk_log_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);

-- =========================================
-- INSERT TIPOS DOCUMENTOS EXEMPLO
-- =========================================

INSERT INTO tipos_documento (nome_tipo, descricao) VALUES
('RG', 'Documento de identidade'),
('CPF', 'Cadastro de pessoa física'),
('Comprovante de residência', 'Conta de água, luz etc');

-- =========================================
-- USUÁRIO ADMIN EXEMPLO
-- =========================================

INSERT INTO usuarios
(nome_completo, email, senha, tipo_usuario)
VALUES
(
    'Administrador Sistema',
    'admin@sced.com',
    '123456',
    'ADMIN'
);