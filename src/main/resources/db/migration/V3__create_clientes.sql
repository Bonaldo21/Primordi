-- V3__seed_admin_cliente.sql
-- Insere o usuário administrador padrão de forma segura
-- Senha original: "admin123" (BCrypt). TROQUE em produção!

INSERT INTO clientes (nome, email, senha_hash, email_verificado, ativo, role)
SELECT 'Administrador',
       'admin@primordi.com.br',
       '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjPNMQ0iPo3lFGqCOIjqMxLVkpJQNm',
       TRUE,
       TRUE,
       'ADMIN'
    WHERE NOT EXISTS (
    SELECT 1 FROM clientes WHERE email = 'admin@primordi.com.br'
);
