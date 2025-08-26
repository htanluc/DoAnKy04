package com.mytech.apartment.jobs;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Auto seed water meter readings for the entire current year on application startup.
 * - Idempotent: generates for a fixed day each month (1st). If a reading already exists on that day, skip.
 * - Uses ServiceFeeConfig for unit price when available; otherwise defaults to 15000 VND/m3.
 * - Uses a small default monthly consumption so invoices have realistic water items by default.
 */
@Component
public class WaterMeterAutoSeedRunner {

    @Autowired private ApartmentRepository apartmentRepository;
    @Autowired private WaterMeterReadingRepository waterRepo;

    private static final long SYSTEM_RECORDED_BY = 0L; // system user placeholder
    private static final int FIXED_READING_DAY = 1; // day-of-month for generated readings

    @PostConstruct
    @Transactional
    public void seedCurrentYearIfMissing() {
        int year = 2025; // Seed cố định cho năm 2025 với giá trị 0
        try {
            List<Apartment> apartments = apartmentRepository.findAll();
            if (apartments.isEmpty()) {
                return;
            }

            System.out.println("DEBUG: WaterMeterAutoSeedRunner - start seeding ZERO readings for year " + year + ", apartments=" + apartments.size());

            for (Apartment apt : apartments) {
                // Không dùng chỉ số trước đó, tạo mặc định 0
                BigDecimal zero = BigDecimal.ZERO;

                for (int month = 1; month <= 12; month++) {
                    LocalDate readingDate = LocalDate.of(year, month, FIXED_READING_DAY);

                    // Idempotent: if a reading already exists for this exact date, skip
                    if (waterRepo.findByApartmentIdAndReadingDate(apt.getId(), readingDate).isPresent()) {
                        continue;
                    }

                    // Tạo chỉ số mặc định 0 cho tất cả các giá trị
                    BigDecimal unitPrice = zero;
                    BigDecimal consumption = zero;
                    BigDecimal meterReading = zero;
                    BigDecimal totalAmount = zero;

                    WaterMeterReading r = new WaterMeterReading();
                    r.setApartmentId(apt.getId());
                    r.setReadingDate(readingDate);
                    r.setMeterReading(meterReading);
                    r.setConsumption(consumption);
                    r.setUnitPrice(unitPrice);
                    r.setTotalAmount(totalAmount);
                    r.setRecordedBy(SYSTEM_RECORDED_BY);

                    waterRepo.save(r);

                    // Không cộng dồn vì luôn 0
                }
            }

            System.out.println("DEBUG: WaterMeterAutoSeedRunner - completed seeding ZERO readings for year " + year);
        } catch (Exception ex) {
            System.err.println("DEBUG: WaterMeterAutoSeedRunner - error: " + ex.getMessage());
        }
    }

    // No price resolution needed for zero seeding
}


