UPDATE clientes
SET senha = '$2a$12$rH5.Feem/eYVgbjgMygWMePddSgcR4RS6nIxY76ltbOKQiua/6VBC',
    atualizado_em = NOW()
WHERE email = 'admin@primordi.com.br';