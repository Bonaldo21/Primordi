package com.primordi.api.modules.live;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LiveEvent {
    private LiveEventType tipo;
    private Object dados;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
