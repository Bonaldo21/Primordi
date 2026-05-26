package com.primordi.api.modules.pagamento.domain;

import lombok.Getter;

@Getter
public enum TipoPagamento {

    CREDIT_CARD("credit_card"),
    DEBIT_CARD("debit_card"),
    TICKET("ticket"),       // Boleto
    BANK_TRANSFER("bank_transfer"), // PIX
    ACCOUNT_MONEY("account_money"); // Saldo Mercado Pago

    private final String valorMercadoPago;

    TipoPagamento(String valorMercadoPago) {
        this.valorMercadoPago = valorMercadoPago;
    }

    public static TipoPagamento fromMercadoPago(String tipoMP) {
        if (tipoMP == null) return null;
        for (TipoPagamento tipo : values()) {
            if (tipo.valorMercadoPago.equalsIgnoreCase(tipoMP)) {
                return tipo;
            }
        }
        return null;
    }
}
