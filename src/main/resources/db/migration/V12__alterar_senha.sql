-- ============================================================
-- Reset da senha do admin
-- Senha em texto plano: admin123
-- Hash gerado com BCrypt strength 10 (mesmo do BCryptPasswordEncoder do Spring)
-- ============================================================

UPDATE clientes
SET senha = '$2a$12$a7IXCZO6rNzYp7PDJHBZNeH9CuRNXLxdFsn0dmkLavi.3iM1hZ1uK',
    atualizado_em = NOW()
WHERE email = 'admin@primordi.com.br';
