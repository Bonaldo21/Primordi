package com.primordi.api.modules.frete.exception;

public class FreteException extends RuntimeException {
    public FreteException(String message) {
        super(message);
    }

    public FreteException(String message, Throwable cause) {
        super(message, cause);
    }
}
