package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ServiceFeeConfigService {
    @Autowired
    private ServiceFeeConfigRepository repository;

    public Optional<ServiceFeeConfig> getByMonthAndYear(int month, int year) {
        return repository.findByMonthAndYear(month, year);
    }

    public ServiceFeeConfig save(ServiceFeeConfig config) {
        return repository.save(config);
    }

    // Có thể thêm các phương thức khác nếu cần
} 