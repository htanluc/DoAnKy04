package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WaterMonthlyFeeService implements MonthlyFeeService {

  @Autowired
  private WaterMeterReadingRepository waterMeterReadingRepository;

  @Autowired
  private ServiceFeeConfigRepository serviceFeeConfigRepository;

  @Autowired
  private InvoiceService invoiceService;

  @Autowired
  private ApartmentRepository apartmentRepository;

  @Override
  @Transactional
  public void generateFeeForMonth(String billingPeriod) {
    YearMonth ym = YearMonth.parse(billingPeriod);

    // Lấy đơn giá nước từ cấu hình tháng
    Optional<ServiceFeeConfig> cfgOpt = serviceFeeConfigRepository.findByMonthAndYear(ym.getMonthValue(), ym.getYear());
    double waterFeePerM3 = cfgOpt.map(ServiceFeeConfig::getWaterFeePerM3).orElse(15000.0);

    // Lấy tất cả readings của tháng và nhóm theo căn hộ để cộng dồn tiêu thụ
    List<WaterMeterReading> readings = waterMeterReadingRepository
        .findAllByReadingDateBetween(ym.atDay(1), ym.atEndOfMonth());

    Map<Long, Double> consumptionByApartment = readings.stream()
        .collect(Collectors.groupingBy(
            WaterMeterReading::getApartmentId,
            Collectors.summingDouble(r -> r.getConsumption() != null ? r.getConsumption().doubleValue() : 0.0)
        ));

    // Thêm item cho tất cả căn hộ (kể cả khi không có readings -> 0 m3)
    List<Apartment> apartments = apartmentRepository.findAll();
    for (Apartment apartment : apartments) {
      long apartmentId = apartment.getId();
      
      double consumption = consumptionByApartment.getOrDefault(apartmentId, 0.0);
      if (consumption < 0) consumption = 0;
      double amount = consumption * waterFeePerM3;
      // Không thêm dòng phí nước nếu không có tiêu thụ (tránh hiện 0 đ trong hóa đơn)
      if (amount <= 0.0) {
        continue;
      }
      String description = String.format("Phí nước tháng %s (%.2f m³ x %.0f VND/m³)", billingPeriod, consumption, waterFeePerM3);
      invoiceService.addInvoiceItem(apartmentId, billingPeriod, "WATER_FEE", description, BigDecimal.valueOf(amount));
    }
  }
}


