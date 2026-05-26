package com.primordi.api.modules.pedido;

public enum StatusPedido {
    AGUARDANDO_PAGAMENTO,   // Pedido criado, esperando pagamento
    PAGAMENTO_APROVADO,     // Pagamento confirmado
    EM_SEPARACAO,           // Preparando o pedido
    ENVIADO,                // Saiu pra entrega
    ENTREGUE,               // Cliente recebeu
    CANCELADO,              // Cancelado pelo cliente/admin
    ESTORNADO               // Pagamento estornado
}
