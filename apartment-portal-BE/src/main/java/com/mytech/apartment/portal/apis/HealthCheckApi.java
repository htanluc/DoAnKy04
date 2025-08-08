package com.mytech.apartment.portal.apis;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckApi {
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
