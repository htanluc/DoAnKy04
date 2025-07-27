package com.mytech.apartment.portal.apis;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import com.mytech.apartment.portal.security.UserDetailsImpl;
import com.mytech.apartment.portal.services.WaterMeterService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private WaterMeterReadingRepository waterReadingRepository;

    // nếu bạn có service cung cấp đơn giá nước
    @Autowired
    private WaterMeterService waterMeterService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        Long userId = ((UserDetailsImpl) authentication.getPrincipal()).getId();

        // 1) Danh sách apartmentId liên kết với user
        List<Long> apartmentIds = apartmentResidentRepository
            .findByIdUserId(userId)
            .stream()
            .map(link -> link.getId().getApartmentId())
            .collect(Collectors.toList());

        // 2) Thống kê hóa đơn
        List<Invoice> invoices = apartmentIds.isEmpty()
            ? Collections.emptyList()
            : invoiceRepository.findByApartmentIdIn(apartmentIds);
        int totalInvoices   = invoices.size();
        int pendingInvoices = (int) invoices.stream()
                                    .filter(i -> i.getStatus() == InvoiceStatus.UNPAID)
                                    .count();
        int overdueInvoices = (int) invoices.stream()
                                    .filter(i -> i.getStatus() == InvoiceStatus.OVERDUE)
                                    .count();
        double totalAmount  = invoices.stream()
                                    .mapToDouble(Invoice::getTotalAmount)
                                    .sum();

        // 3) Thống kê nước tháng trước
        String lastMonth = LocalDate.now()
            .minusMonths(1)
            .format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<WaterMeterReading> readings = apartmentIds.isEmpty()
            ? Collections.emptyList()
            : waterReadingRepository.findAllByReadingMonth(lastMonth)
                .stream()
                .filter(r -> apartmentIds.contains(r.getApartmentId()))
                .collect(Collectors.toList());

        // Tổng tiêu thụ và tổng phí nước
        BigDecimal totalConsumption = readings.stream()
            .map(WaterMeterReading::getConsumption)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal unitPrice = new BigDecimal("5000");  // hoặc lấy từ config
        BigDecimal totalWaterFee = totalConsumption.multiply(unitPrice);

        // 4) Kết hợp trả về
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInvoices",   totalInvoices);
        stats.put("pendingInvoices", pendingInvoices);
        stats.put("overdueInvoices", overdueInvoices);
        stats.put("totalAmount",     totalAmount);

        stats.put("waterPeriod",         lastMonth);
        stats.put("totalConsumptionM3",  totalConsumption);
        stats.put("totalWaterFee",       totalWaterFee);

        return ResponseEntity.ok(stats);
    }
}
