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
        // Upsert theo (month, year) để tránh trùng cấu hình
        int month = config.getMonth();
        int year = config.getYear();
        Optional<ServiceFeeConfig> existing = repository.findByMonthAndYear(month, year);
        if (existing.isPresent()) {
            ServiceFeeConfig entity = existing.get();
            entity.setServiceFeePerM2(config.getServiceFeePerM2());
            entity.setWaterFeePerM3(config.getWaterFeePerM3());
            entity.setMotorcycleFee(config.getMotorcycleFee());
            entity.setCar4SeatsFee(config.getCar4SeatsFee());
            entity.setCar7SeatsFee(config.getCar7SeatsFee());
            return repository.save(entity);
        }
        return repository.save(config);
    }

    // Có thể thêm các phương thức khác nếu cần
} 