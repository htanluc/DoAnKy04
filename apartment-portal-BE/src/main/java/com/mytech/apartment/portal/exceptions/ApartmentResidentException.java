package com.mytech.apartment.portal.exceptions;

public class ApartmentResidentException extends RuntimeException {
    
    public ApartmentResidentException(String message) {
        super(message);
    }
    
    public ApartmentResidentException(String message, Throwable cause) {
        super(message, cause);
    }
}
