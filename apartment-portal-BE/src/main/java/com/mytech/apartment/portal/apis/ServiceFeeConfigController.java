package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.services.ServiceFeeConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/service-fee-config")
public class ServiceFeeConfigController {
    private final ServiceFeeConfigService service;

    public ServiceFeeConfigController(ServiceFeeConfigService service) {
        this.service = service;
    }

    @GetMapping("/{month}/{year}")
    public ResponseEntity<ServiceFeeConfig> getConfig(
        @PathVariable("month") int month,
        @PathVariable("year") int year
    ) {
        Optional<ServiceFeeConfig> config = service.getByMonthAndYear(month, year);
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServiceFeeConfig> createOrUpdate(@RequestBody ServiceFeeConfig config) {
        ServiceFeeConfig saved = service.save(config);
        return ResponseEntity.ok(saved);
    }
} 