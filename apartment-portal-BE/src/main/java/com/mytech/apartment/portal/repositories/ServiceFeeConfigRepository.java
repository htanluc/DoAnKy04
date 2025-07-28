package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ServiceFeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServiceFeeConfigRepository extends JpaRepository<ServiceFeeConfig, Long> {
    Optional<ServiceFeeConfig> findByMonthAndYear(Integer month, Integer year);
    // Có thể thêm các phương thức truy vấn khác nếu cần
} 