package com.primordi.api.modules.live;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
public class LiveEventService {

    private static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L; // 30 min

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong();

    public SseEmitter subscribe() {
        long id = idCounter.incrementAndGet();
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitter.onCompletion(() -> {
            emitters.remove(id);
            log.debug("SSE desconectado: {}", id);
        });
        emitter.onTimeout(() -> {
            emitters.remove(id);
            emitter.complete();
        });
        emitter.onError(e -> {
            emitters.remove(id);
            log.debug("SSE erro no cliente {}: {}", id, e.getMessage());
        });

        emitters.put(id, emitter);
        log.info("SSE conectado: {} (total: {})", id, emitters.size());

        // Ping inicial para confirmar conexão
        publicar(LiveEvent.builder().tipo(LiveEventType.PING).dados("connected").build(), id, emitter);

        return emitter;
    }

    public void publicar(LiveEvent evento) {
        if (emitters.isEmpty()) return;
        emitters.forEach((id, emitter) -> publicar(evento, id, emitter));
    }

    public int totalConectados() {
        return emitters.size();
    }

    private void publicar(LiveEvent evento, Long id, SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event()
                    .name(evento.getTipo().name())
                    .data(evento));
        } catch (IOException e) {
            emitters.remove(id);
            emitter.completeWithError(e);
        }
    }
}
