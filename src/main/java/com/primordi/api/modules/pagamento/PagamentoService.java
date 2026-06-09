package com.primordi.api.modules.pagamento;

import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public PagamentoResponse criarPagamento(CriarPagamentoRequest dto) {
        Pedido pedido = pedidoRepository.findById(dto.getPedidoId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", dto.getPedidoId()));

        if (pagamentoRepository.existsByPedidoIdAndStatus(pedido.getId(), StatusPagamento.APROVADO)) {
            throw new BusinessException("Este pedido já possui pagamento aprovado.");
        }

        return switch (dto.getMetodo()) {
            case PIX -> criarPix(pedido, dto);
            case CARTAO_CREDITO, CARTAO_DEBITO -> criarCartao(pedido, dto);
            case BOLETO -> criarBoleto(pedido, dto);
        };
    }

    // =====================================================
    // PIX
    // =====================================================

    private PagamentoResponse criarPix(Pedido pedido, CriarPagamentoRequest dto) {
        try {
            PaymentClient client = new PaymentClient();

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(pedido.getTotal())
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

            Pagamento pagamento = Pagamento.builder()
                    .pedidoId(pedido.getId())
                    .metodo(MetodoPagamento.PIX)
                    .status(StatusPagamento.fromMercadoPago(payment.getStatus()))
                    .valor(pedido.getTotal())
                    .transacaoId(String.valueOf(payment.getId()))
                    .qrCode(payment.getPointOfInteraction() != null
                            ? payment.getPointOfInteraction().getTransactionData().getQrCode() : null)
                    .qrCodeBase64(payment.getPointOfInteraction() != null
                            ? payment.getPointOfInteraction().getTransactionData().getQrCodeBase64() : null)
                    .build();

            return PagamentoResponse.fromEntity(pagamentoRepository.save(pagamento));

        } catch (MPApiException e) {
            String body = e.getApiResponse() != null ? e.getApiResponse().getContent() : "sem body";
            log.error("Erro MP ao criar PIX: status={} body={}", e.getStatusCode(), body);
            throw new BusinessException("Erro ao processar PIX [" + e.getStatusCode() + "]: " + body);
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

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(pedido.getTotal())
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
                    .valor(pedido.getTotal())
                    .parcelas(dto.getParcelas())
                    .transacaoId(String.valueOf(payment.getId()))
                    .build();

            Pagamento salvo = pagamentoRepository.save(pagamento);

            if (salvo.getStatus() == StatusPagamento.APROVADO) {
                aprovarPedido(pedido);
            }

            return PagamentoResponse.fromEntity(salvo);

        } catch (MPApiException e) {
            String body = e.getApiResponse() != null ? e.getApiResponse().getContent() : "sem body";
            log.error("Erro MP ao criar cartão: status={} body={}", e.getStatusCode(), body);
            throw new BusinessException("Erro ao processar cartão [" + e.getStatusCode() + "]: " + body);
        } catch (MPException e) {
            log.error("Erro ao criar pagamento cartão: {}", e.getMessage());
            throw new BusinessException("Erro ao processar cartão: " + e.getMessage());
        }
    }

    // =====================================================
    // BOLETO
    // =====================================================

    private PagamentoResponse criarBoleto(Pedido pedido, CriarPagamentoRequest dto) {
        try {
            PaymentClient client = new PaymentClient();

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(pedido.getTotal())
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
                            .build())
                    .notificationUrl(notificationUrlValida())
                    .build();

            Payment payment = client.create(request);

            Pagamento pagamento = Pagamento.builder()
                    .pedidoId(pedido.getId())
                    .metodo(MetodoPagamento.BOLETO)
                    .status(StatusPagamento.fromMercadoPago(payment.getStatus()))
                    .valor(pedido.getTotal())
                    .transacaoId(String.valueOf(payment.getId()))
                    .linkBoleto(payment.getTransactionDetails() != null
                            ? payment.getTransactionDetails().getExternalResourceUrl() : null)
                    .build();

            return PagamentoResponse.fromEntity(pagamentoRepository.save(pagamento));

        } catch (MPApiException e) {
            String body = e.getApiResponse() != null ? e.getApiResponse().getContent() : "sem body";
            log.error("Erro MP ao criar boleto: status={} body={}", e.getStatusCode(), body);
            throw new BusinessException("Erro ao processar boleto [" + e.getStatusCode() + "]: " + body);
        } catch (MPException e) {
            log.error("Erro ao criar boleto: {}", e.getMessage());
            throw new BusinessException("Erro ao processar boleto: " + e.getMessage());
        }
    }

    // =====================================================
    // WEBHOOK
    // =====================================================

    @Transactional
    public void processarWebhook(WebhookMercadoPagoRequest webhook) {
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

    public PagamentoResponse consultarPorPedido(Long pedidoId) {
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

    private String primeiroNome(String nome) {
        if (nome == null || nome.isBlank()) return "Cliente";
        return nome.split(" ")[0];
    }

    private String ultimoNome(String nome) {
        if (nome == null || !nome.contains(" ")) return "";
        return nome.substring(nome.indexOf(" ") + 1);
    }
}