package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.Vehicle;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleMonthlyFeeService implements MonthlyFeeService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod) {
        // Lấy tất cả căn hộ có cư dân
        List<ApartmentResident> apartmentResidents = apartmentResidentRepository.findAll();
        
        for (ApartmentResident apartmentResident : apartmentResidents) {
            Long apartmentId = apartmentResident.getId().getApartmentId();
            Long residentUserId = apartmentResident.getId().getUserId();
            
            // Lấy danh sách xe của cư dân
            List<Vehicle> vehicles = vehicleRepository.findByResidentUserId(residentUserId);
            
            for (Vehicle vehicle : vehicles) {
                // Chỉ tính phí cho xe máy và ô tô
                if (vehicle.getVehicleType() == VehicleType.MOTORCYCLE || 
                    vehicle.getVehicleType() == VehicleType.CAR_4_SEATS ||
                    vehicle.getVehicleType() == VehicleType.CAR_7_SEATS) {
                    
                    // Lấy cấu hình phí xe cho tháng
                    YearMonth yearMonth = YearMonth.parse(billingPeriod);
                    Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
                        .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
                    
                    double monthlyFee = getVehicleFee(vehicle.getVehicleType(), config);
                    
                    String vehicleType = vehicle.getVehicleType().getDisplayName();
                    
                    // Thêm vào hóa đơn
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