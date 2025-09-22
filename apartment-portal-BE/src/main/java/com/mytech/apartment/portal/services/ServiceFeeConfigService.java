package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.time.YearMonth;
import com.mytech.apartment.portal.repositories.InvoiceRepository;

@Service
public class ServiceFeeConfigService {
    @Autowired
    private ServiceFeeConfigRepository repository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    public Optional<ServiceFeeConfig> getByMonthAndYear(int month, int year) {
        return repository.findByMonthAndYear(month, year);
    }

    public ServiceFeeConfig save(ServiceFeeConfig config) {
        // Upsert theo (month, year) để tránh trùng cấu hình
        int month = config.getMonth();
        int year = config.getYear();

        // Chặn sửa biểu phí quá khứ và tháng hiện tại nếu đã tạo hóa đơn
        YearMonth target = YearMonth.of(year, month);
        YearMonth current = YearMonth.now();
        if (target.isBefore(current)) {
            throw new IllegalStateException("Không được cập nhật biểu phí của tháng quá khứ");
        }
        if (target.equals(current)) {
            String prefix = String.format("%04d-%02d", year, month);
            long count = invoiceRepository.countByBillingPeriodStartingWith(prefix);
            if (count > 0) {
                throw new IllegalStateException("Không được cập nhật biểu phí tháng hiện tại vì đã tạo hóa đơn");
            }
        }
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