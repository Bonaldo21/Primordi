package com.primordi.api.modules.live;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/live")
@RequiredArgsConstructor
public class LiveController {

    private final LiveEventService liveEventService;

    /**
     * Cliente se inscreve para receber eventos em tempo real.
     * Uso: GET /api/live/eventos (EventSource no frontend)
     */
    @GetMapping(value = "/eventos", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter eventos() {
        return liveEventService.subscribe();
    }

    /** Status da tela live: quantos clientes conectados */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "conectados", liveEventService.totalConectados(),
                "status", "online"
        ));
    }
}
