package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.Apartment;
// import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.Vehicle;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
// import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleMonthlyFeeService implements MonthlyFeeService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod) {
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());

        // Duyệt toàn bộ căn hộ để luôn có dòng phí (kể cả 0 xe)
        List<Apartment> apartments = apartmentRepository.findAll();
        for (Apartment apartment : apartments) {
            Long apartmentId = apartment.getId();

            // Lấy danh sách xe gắn với căn hộ này (đúng căn hộ hiện tại)
            List<Vehicle> vehiclesInApartment = vehicleRepository.findByApartmentId(apartmentId);

            // Lọc xe tính phí theo loại xe được charge
            List<Vehicle> chargeableVehicles = new ArrayList<>();
            for (Vehicle v : vehiclesInApartment) {
                if (v.getVehicleType() == VehicleType.MOTORCYCLE ||
                    v.getVehicleType() == VehicleType.CAR_4_SEATS ||
                    v.getVehicleType() == VehicleType.CAR_7_SEATS) {
                    chargeableVehicles.add(v);
                }
            }

            if (chargeableVehicles.isEmpty()) {
                // Không có xe -> thêm dòng phí 0 để minh bạch
                invoiceService.addInvoiceItem(
                    apartmentId,
                    billingPeriod,
                    "VEHICLE_FEE",
                    String.format("Phí gửi xe tháng %s (0 xe)", billingPeriod),
                    BigDecimal.valueOf(0)
                );
                continue;
            }

            // Có xe -> thêm theo từng xe
            for (Vehicle vehicle : chargeableVehicles) {
                double monthlyFee = getVehicleFee(vehicle.getVehicleType(), config);
                String vehicleType = vehicle.getVehicleType().getDisplayName();
                invoiceService.addInvoiceItem(
                    apartmentId,
                    billingPeriod,
                    "VEHICLE_FEE",
                    String.format("Phí gửi xe %s tháng %s", vehicleType, billingPeriod),
                    BigDecimal.valueOf(monthlyFee)
                );
            }
        }
    }

    private double getVehicleFee(VehicleType vehicleType, Optional<ServiceFeeConfig> config) {
        if (config.isPresent()) {
            ServiceFeeConfig feeConfig = config.get();
            switch (vehicleType) {
                case MOTORCYCLE:
                    return feeConfig.getMotorcycleFee();
                case CAR_4_SEATS:
                    return feeConfig.getCar4SeatsFee();
                case CAR_7_SEATS:
                    return feeConfig.getCar7SeatsFee();
                default:
                    return 0.0;
            }
        }
        
        // Giá mặc định nếu không có cấu hình
        switch (vehicleType) {
            case MOTORCYCLE:
                return 50000.0;
            case CAR_4_SEATS:
                return 200000.0;
            case CAR_7_SEATS:
                return 250000.0;
            default:
                return 0.0;
        }
    }
} 