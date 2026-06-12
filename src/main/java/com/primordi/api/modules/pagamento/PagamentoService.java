package com.primordi.api.modules.pagamento;

import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerAddressRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.pagamento.config.MercadoPagoProperties;
import com.primordi.api.modules.pagamento.domain.MetodoPagamento;
import com.primordi.api.modules.pagamento.domain.Pagamento;
import com.primordi.api.modules.pagamento.domain.StatusPagamento;
import com.primordi.api.modules.pagamento.dto.CriarPagamentoRequest;
import com.primordi.api.modules.pagamento.dto.PagamentoResponse;
import com.primordi.api.modules.pagamento.dto.WebhookMercadoPagoRequest;
import com.primordi.api.modules.pagamento.repository.PagamentoRepository;
import com.primordi.api.modules.pedido.PedidoRepository;
import com.primordi.api.modules.pedido.Pedido;
import com.primordi.api.modules.pedido.StatusPedido;
import com.primordi.api.shared.exception.BusinessException;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PedidoRepository pedidoRepository;
    private final MercadoPagoProperties mpProperties;

    // =====================================================
    // CRIAR PAGAMENTO
    // =====================================================

    private static final java.math.BigDecimal DESCONTO_PIX_BOLETO = new java.math.BigDecimal("0.90");

    @Transactional
    public PagamentoResponse criarPagamento(CriarPagamentoRequest dto, Cliente cliente) {
        Pedido pedido = pedidoRepository.findById(dto.getPedidoId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", dto.getPedidoId()));

        if (!pedido.getCliente().getId().equals(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este pedido.");
        }

        if (pagamentoRepository.existsByPedidoIdAndStatus(pedido.getId(), StatusPagamento.APROVADO)) {
            throw new BusinessException("Este pedido já possui pagamento aprovado.");
        }

        return switch (dto.getMetodo()) {
            case PIX -> criarPix(pedido, dto);
            case CARTAO_CREDITO, CARTAO_DEBITO -> criarCartao(pedido, dto);
            case BOLETO -> criarBoleto(pedido, dto);
        };
    }

    private java.math.BigDecimal totalParaMetodo(Pedido pedido, MetodoPagamento metodo) {
        java.math.BigDecimal total = pedido.getTotal();
        if (metodo == MetodoPagamento.PIX || metodo == MetodoPagamento.BOLETO) {
            return total.multiply(DESCONTO_PIX_BOLETO).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return total;
    }

    // =====================================================
    // PIX
    // =====================================================

    private PagamentoResponse criarPix(Pedido pedido, CriarPagamentoRequest dto) {
        try {
            PaymentClient client = new PaymentClient();
            java.math.BigDecimal total = totalParaMetodo(pedido, MetodoPagamento.PIX);

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(total)
                    .description("Pedido " + pedido.getCodigo())
                    .paymentMethodId("pix")
                    .payer(PaymentPayerRequest.builder()
                            .email(dto.getPagadorEmail())
                            .firstName(primeiroNome(dto.getPagadorNome()))
                            .lastName(ultimoNome(dto.getPagadorNome()))
                            .identification(IdentificationRequest.builder()
                                    .type("CPF")
                                    .number(dto.getPagadorCpf())
                                    .build())
                            .build())
                    .notificationUrl(notificationUrlValida())
                    .build();

            Payment payment = client.create(request);

            String qrCode = null;
            String qrCodeBase64 = null;
            if (payment.getPointOfInteraction() != null
                    && payment.getPointOfInteraction().getTransactionData() != null) {
                qrCode = payment.getPointOfInteraction().getTransactionData().getQrCode();
                qrCodeBase64 = payment.getPointOfInteraction().getTransactionData().getQrCodeBase64();
            }
            log.info("PIX gerado: transacaoId={} qrCode={}", payment.getId(), qrCode != null ? "OK" : "NULL");

            Pagamento pagamento = Pagamento.builder()
                    .pedidoId(pedido.getId())
                    .metodo(MetodoPagamento.PIX)
                    .status(StatusPagamento.fromMercadoPago(payment.getStatus()))
                    .valor(total)
                    .transacaoId(String.valueOf(payment.getId()))
                    .qrCode(qrCode)
                    .qrCodeBase64(qrCodeBase64)
                    .build();

            return PagamentoResponse.fromEntity(pagamentoRepository.save(pagamento));

        } catch (MPApiException e) {
            throw traduzirErroPagamento(e, "PIX");
        } catch (MPException e) {
            log.error("Erro ao criar PIX: {}", e.getMessage());
            throw new BusinessException("Erro ao processar PIX: " + e.getMessage());
        }
    }

    // =====================================================
    // CARTÃO
    // =====================================================

    private PagamentoResponse criarCartao(Pedido pedido, CriarPagamentoRequest dto) {
        if (dto.getCardToken() == null || dto.getCardToken().isBlank()) {
            throw new BusinessException("cardToken é obrigatório para pagamento com cartão.");
        }
        try {
            PaymentClient client = new PaymentClient();
            java.math.BigDecimal total = totalParaMetodo(pedido, dto.getMetodo());

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(total)
                    .token(dto.getCardToken())
                    .description("Pedido " + pedido.getCodigo())
                    .installments(dto.getParcelas() != null ? dto.getParcelas() : 1)
                    .paymentMethodId(dto.getPaymentMethodId())
                    .payer(PaymentPayerRequest.builder()
                            .email(dto.getPagadorEmail())
                            .build())
                    .notificationUrl(notificationUrlValida())
                    .build();

            Payment payment = client.create(request);

            Pagamento pagamento = Pagamento.builder()
                    .pedidoId(pedido.getId())
                    .metodo(dto.getMetodo())
                    .status(StatusPagamento.fromMercadoPago(payment.getStatus()))
                    .statusDetalhe(payment.getStatusDetail())
                    .valor(total)
                    .parcelas(dto.getParcelas())
                    .transacaoId(String.valueOf(payment.getId()))
                    .build();

            Pagamento salvo = pagamentoRepository.save(pagamento);

            if (salvo.getStatus() == StatusPagamento.APROVADO) {
                aprovarPedido(pedido);
            }

            return PagamentoResponse.fromEntity(salvo);

        } catch (MPApiException e) {
            throw traduzirErroPagamento(e, "cartão");
        } catch (MPException e) {
            log.error("Erro ao criar pagamento cartão: {}", e.getMessage());
            throw new BusinessException("Erro ao processar cartão: " + e.getMessage());
        }
    }

    // =====================================================
    // BOLETO
    // =====================================================

    private PagamentoResponse criarBoleto(Pedido pedido, CriarPagamentoRequest dto) {
        var endereco = pedido.getEnderecoEntrega();
        if (endereco == null) {
            throw new BusinessException("Boleto não disponível para pedidos com retirada na loja. Use PIX ou cartão.");
        }

        try {
            PaymentClient client = new PaymentClient();
            java.math.BigDecimal total = totalParaMetodo(pedido, MetodoPagamento.BOLETO);

            PaymentPayerAddressRequest payerAddress = PaymentPayerAddressRequest.builder()
                    .zipCode(endereco.getCep().replaceAll("\\D", ""))
                    .streetName(endereco.getLogradouro())
                    .streetNumber(endereco.getNumero())
                    .neighborhood(endereco.getBairro())
                    .city(endereco.getCidade())
                    .federalUnit(endereco.getEstado())
                    .build();

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(total)
                    .description("Pedido " + pedido.getCodigo())
                    .paymentMethodId("bolbradesco")
                    .payer(PaymentPayerRequest.builder()
                            .email(dto.getPagadorEmail())
                            .firstName(primeiroNome(dto.getPagadorNome()))
                            .lastName(ultimoNome(dto.getPagadorNome()))
                            .identification(IdentificationRequest.builder()
                                    .type("CPF")
                                    .number(dto.getPagadorCpf())
                                    .build())
                            .address(payerAddress)
                            .build())
                    .notificationUrl(notificationUrlValida())
                    .build();

            Payment payment = client.create(request);

            Pagamento pagamento = Pagamento.builder()
                    .pedidoId(pedido.getId())
                    .metodo(MetodoPagamento.BOLETO)
                    .status(StatusPagamento.fromMercadoPago(payment.getStatus()))
                    .valor(total)
                    .transacaoId(String.valueOf(payment.getId()))
                    .linkBoleto(payment.getTransactionDetails() != null
                            ? payment.getTransactionDetails().getExternalResourceUrl() : null)
                    .build();

            return PagamentoResponse.fromEntity(pagamentoRepository.save(pagamento));

        } catch (MPApiException e) {
            throw traduzirErroPagamento(e, "boleto");
        } catch (MPException e) {
            log.error("Erro ao criar boleto: {}", e.getMessage());
            throw new BusinessException("Erro ao processar boleto: " + e.getMessage());
        }
    }

    // =====================================================
    // WEBHOOK
    // =====================================================

    @Transactional
    public void processarWebhook(WebhookMercadoPagoRequest webhook, String xSignature, String xRequestId) {
        validarAssinaturaWebhook(xSignature, xRequestId, webhook);
        if (!"payment".equals(webhook.getType())) return;

        String transacaoId = String.valueOf(webhook.getData() != null ? webhook.getData().getId() : null);
        if (transacaoId == null || transacaoId.equals("null")) return;

        pagamentoRepository.findByTransacaoId(transacaoId).ifPresent(pagamento -> {
            try {
                PaymentClient client = new PaymentClient();
                Payment payment = client.get(Long.parseLong(transacaoId));
                StatusPagamento novoStatus = StatusPagamento.fromMercadoPago(payment.getStatus());

                pagamento.atualizarStatus(novoStatus, payment.getStatusDetail());
                pagamentoRepository.save(pagamento);

                if (novoStatus == StatusPagamento.APROVADO) {
                    pedidoRepository.findById(pagamento.getPedidoId())
                            .ifPresent(this::aprovarPedido);
                }

                log.info("Webhook processado: pagamento {} → {}", transacaoId, novoStatus);
            } catch (MPException | MPApiException e) {
                log.error("Erro ao processar webhook: {}", e.getMessage());
            }
        });
    }

    // =====================================================
    // CONSULTA
    // =====================================================

    public PagamentoResponse consultarPorPedido(Long pedidoId, Cliente cliente) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", pedidoId));

        if (!pedido.getCliente().getId().equals(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este pedido.");
        }

        return pagamentoRepository
                .findByPedidoIdOrderByCriadoEmDesc(pedidoId)
                .stream().findFirst()
                .map(PagamentoResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento do pedido", pedidoId));
    }

    public String obterPublicKey() {
        return mpProperties.getPublicKey();
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private void aprovarPedido(Pedido pedido) {
        pedido.setStatus(StatusPedido.PAGAMENTO_APROVADO);
        pedidoRepository.save(pedido);
        log.info("Pedido {} aprovado após pagamento.", pedido.getCodigo());
    }

    /**
     * Retorna a notification URL apenas se for uma URL pública válida.
     * O Mercado Pago rejeita URLs localhost/127.0.0.1 com erro 400.
     */
    private String notificationUrlValida() {
        String url = mpProperties.getNotificationUrl();
        if (url == null || url.isBlank()) return null;
        if (url.contains("localhost") || url.contains("127.0.0.1")) return null;
        return url;
    }

    private BusinessException traduzirErroPagamento(MPApiException e, String metodo) {
        String body = e.getApiResponse() != null ? e.getApiResponse().getContent() : "";
        log.error("Erro MP ao criar {}: status={} body={}", metodo, e.getStatusCode(), body);
        if (body.contains("2067") || body.contains("Invalid user identification")) {
            return new BusinessException("CPF inválido. Verifique o CPF informado e tente novamente.");
        }
        return new BusinessException("Erro ao processar " + metodo + " [" + e.getStatusCode() + "]: " + body);
    }

    /**
     * Valida o header x-signature enviado pelo Mercado Pago.
     * Formato: ts=<timestamp>,v1=<hmac-sha256>
     * O MP assina: "id:<dataId>;request-id:<xRequestId>;ts:<ts>;"
     */
    private void validarAssinaturaWebhook(String xSignature, String xRequestId, WebhookMercadoPagoRequest webhook) {
        String secret = mpProperties.getWebhookSecret();
        if (secret == null || secret.isBlank()) {
            log.warn("WEBHOOK_SECRET não configurado — validação de assinatura ignorada");
            return;
        }
        if (xSignature == null || xSignature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura do webhook ausente.");
        }

        String ts = null;
        String v1 = null;
        for (String part : xSignature.split(",")) {
            String[] kv = part.trim().split("=", 2);
            if (kv.length == 2) {
                if ("ts".equals(kv[0])) ts = kv[1];
                else if ("v1".equals(kv[0])) v1 = kv[1];
            }
        }

        if (ts == null || v1 == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Formato de assinatura inválido.");
        }

        String dataId = webhook.getData() != null ? webhook.getData().getId() : "";
        String manifest = "id:" + dataId + ";request-id:" + (xRequestId != null ? xRequestId : "") + ";ts:" + ts + ";";

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            if (!hex.toString().equals(v1)) {
                log.warn("Assinatura de webhook inválida. manifest={}", manifest);
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura do webhook inválida.");
            }
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Erro ao validar assinatura do webhook", e);
        }
    }

    private String primeiroNome(String nome) {
        if (nome == null || nome.isBlank()) return "Cliente";
        return nome.split(" ")[0];
    }

    private String ultimoNome(String nome) {
        if (nome == null || !nome.contains(" ")) return primeiroNome(nome);
        return nome.substring(nome.indexOf(" ") + 1);
    }
}