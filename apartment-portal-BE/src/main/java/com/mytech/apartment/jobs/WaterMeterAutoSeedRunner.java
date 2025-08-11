package com.mytech.apartment.jobs;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
    @Autowired private ServiceFeeConfigRepository feeCfgRepo;

    private static final long SYSTEM_RECORDED_BY = 0L; // system user placeholder
    private static final BigDecimal DEFAULT_MONTHLY_CONSUMPTION_M3 = BigDecimal.valueOf(10); // 10 m3 / month
    private static final int FIXED_READING_DAY = 1; // day-of-month for generated readings

    @PostConstruct
    @Transactional
    public void seedCurrentYearIfMissing() {
        int year = LocalDate.now().getYear();
        try {
            List<Apartment> apartments = apartmentRepository.findAll();
            if (apartments.isEmpty()) {
                return;
            }

            System.out.println("DEBUG: WaterMeterAutoSeedRunner - start seeding for year " + year + ", apartments=" + apartments.size());

            for (Apartment apt : apartments) {
                BigDecimal lastMeter = getLastMeterBefore(apt.getId(), LocalDate.of(year, 1, 1));

                for (int month = 1; month <= 12; month++) {
                    LocalDate readingDate = LocalDate.of(year, month, FIXED_READING_DAY);

                    // Idempotent: if a reading already exists for this exact date, skip
                    if (waterRepo.findByApartmentIdAndReadingDate(apt.getId(), readingDate).isPresent()) {
                        continue;
                    }

                    BigDecimal unitPrice = BigDecimal.valueOf(resolveUnitPrice(month, year));
                    BigDecimal consumption = DEFAULT_MONTHLY_CONSUMPTION_M3;
                    BigDecimal meterReading = lastMeter.add(consumption);
                    BigDecimal totalAmount = consumption.multiply(unitPrice);

                    WaterMeterReading r = new WaterMeterReading();
                    r.setApartmentId(apt.getId());
                    r.setReadingDate(readingDate);
                    r.setMeterReading(meterReading);
                    r.setConsumption(consumption);
                    r.setUnitPrice(unitPrice);
                    r.setTotalAmount(totalAmount);
                    r.setRecordedBy(SYSTEM_RECORDED_BY);

                    waterRepo.save(r);

                    lastMeter = meterReading;
                }
            }

            System.out.println("DEBUG: WaterMeterAutoSeedRunner - completed seeding for year " + year);
        } catch (Exception ex) {
            System.err.println("DEBUG: WaterMeterAutoSeedRunner - error: " + ex.getMessage());
        }
    }

    private BigDecimal getLastMeterBefore(Long apartmentId, LocalDate date) {
        return waterRepo
                .findTopByApartmentIdAndReadingDateLessThanOrderByReadingDateDesc(apartmentId, date)
                .map(WaterMeterReading::getMeterReading)
                .orElse(BigDecimal.ZERO);
    }

    private double resolveUnitPrice(int month, int year) {
        Optional<ServiceFeeConfig> cfg = feeCfgRepo.findByMonthAndYear(month, year);
        return cfg.map(ServiceFeeConfig::getWaterFeePerM3).orElse(15000.0);
    }
}


