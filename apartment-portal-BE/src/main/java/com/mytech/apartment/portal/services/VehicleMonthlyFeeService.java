package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.Vehicle;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.VehicleRepository;
import java.util.stream.Collectors;
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
    
    @Autowired
    private ApartmentRepository apartmentRepository;

    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod) {
        // Lấy tất cả căn hộ
        List<Long> apartmentIds = apartmentRepository.findAll().stream()
            .map(apartment -> apartment.getId())
            .collect(Collectors.toList());
        
        System.out.println("DEBUG: VehicleMonthlyFeeService - Tìm thấy " + apartmentIds.size() + " căn hộ");
        
        // Lấy cấu hình phí xe cho tháng
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
        
        for (Long apartmentId : apartmentIds) {
            // Lấy cư dân của căn hộ
            List<ApartmentResident> apartmentResidents = apartmentResidentRepository
                .findByIdApartmentId(apartmentId);
            
            double totalVehicleFee = 0.0;
            StringBuilder description = new StringBuilder();
            description.append("Phí gửi xe tháng ").append(billingPeriod).append(": ");
            
            // Đếm số lượng từng loại xe
            int motorcycleCount = 0;
            int car4SeatsCount = 0;
            int car7SeatsCount = 0;
            double motorcycleFee = 0.0;
            double car4SeatsFee = 0.0;
            double car7SeatsFee = 0.0;
            
            boolean hasVehicles = false;
            
            for (ApartmentResident apartmentResident : apartmentResidents) {
                Long residentUserId = apartmentResident.getId().getUserId();
                
                // Lấy danh sách xe của cư dân
                List<Vehicle> vehicles = vehicleRepository.findByUserId(residentUserId);
                
                for (Vehicle vehicle : vehicles) {
                    // Chỉ tính phí cho xe máy và ô tô
                    if (vehicle.getVehicleType() == VehicleType.MOTORCYCLE || 
                        vehicle.getVehicleType() == VehicleType.CAR_4_SEATS ||
                        vehicle.getVehicleType() == VehicleType.CAR_7_SEATS) {
                        
                        double monthlyFee = getVehicleFee(vehicle.getVehicleType(), config);
                        String vehicleType = vehicle.getVehicleType().getDisplayName();
                        
                        totalVehicleFee += monthlyFee;
                        hasVehicles = true;
                        
                        // Đếm số lượng từng loại xe
                        switch (vehicle.getVehicleType()) {
                            case MOTORCYCLE:
                                motorcycleCount++;
                                motorcycleFee += monthlyFee;
                                break;
                            case CAR_4_SEATS:
                                car4SeatsCount++;
                                car4SeatsFee += monthlyFee;
                                break;
                            case CAR_7_SEATS:
                                car7SeatsCount++;
                                car7SeatsFee += monthlyFee;
                                break;
                        }
                        
                        System.out.println("DEBUG: VehicleMonthlyFeeService - Xe " + vehicleType + " của cư dân " + residentUserId + 
                            " phí " + monthlyFee + " VND");
                    }
                }
            }
            
            // Tạo mô tả chi tiết từng loại xe
            if (hasVehicles) {
                boolean firstItem = true;
                
                if (motorcycleCount > 0) {
                    if (!firstItem) description.append(", ");
                    description.append(motorcycleCount).append(" xe máy (").append(motorcycleFee).append(" VND)");
                    firstItem = false;
                }
                
                if (car4SeatsCount > 0) {
                    if (!firstItem) description.append(", ");
                    description.append(car4SeatsCount).append(" ô tô 4 chỗ (").append(car4SeatsFee).append(" VND)");
                    firstItem = false;
                }
                
                if (car7SeatsCount > 0) {
                    if (!firstItem) description.append(", ");
                    description.append(car7SeatsCount).append(" ô tô 7 chỗ (").append(car7SeatsFee).append(" VND)");
                    firstItem = false;
                }
            } else {
                // Luôn hiển thị chi tiết từng loại xe, ngay cả khi không có xe
                description.append("0 xe máy (0 VND), 0 ô tô 4 chỗ (0 VND), 0 ô tô 7 chỗ (0 VND)");
            }
            
            System.out.println("DEBUG: VehicleMonthlyFeeService - Căn hộ " + apartmentId + 
                " tổng phí xe " + totalVehicleFee + " VND");
            System.out.println("DEBUG: VehicleMonthlyFeeService - Chi tiết: " + motorcycleCount + " xe máy, " + 
                car4SeatsCount + " ô tô 4 chỗ, " + car7SeatsCount + " ô tô 7 chỗ");

            // Thêm vào hóa đơn (luôn thêm, có thể là 0)
            try {
                invoiceService.addInvoiceItem(
                    apartmentId,
                    billingPeriod,
                    "VEHICLE_FEE",
                    description.toString(),
                    BigDecimal.valueOf(totalVehicleFee)
                );
                System.out.println("DEBUG: VehicleMonthlyFeeService - Đã thêm phí xe cho căn hộ " + apartmentId);
            } catch (Exception e) {
                System.err.println("DEBUG: VehicleMonthlyFeeService - Lỗi khi thêm phí xe cho căn hộ " + apartmentId + ": " + e.getMessage());
            }
        }
    }
    
    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod, Long apartmentId) {
        // Lấy cư dân của căn hộ cụ thể
        List<ApartmentResident> apartmentResidents = apartmentResidentRepository
            .findByIdApartmentId(apartmentId);
        
        // Lấy cấu hình phí xe cho tháng
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
        
        double totalVehicleFee = 0.0;
        StringBuilder description = new StringBuilder();
        description.append("Phí gửi xe tháng ").append(billingPeriod).append(": ");
        
        // Đếm số lượng từng loại xe
        int motorcycleCount = 0;
        int car4SeatsCount = 0;
        int car7SeatsCount = 0;
        double motorcycleFee = 0.0;
        double car4SeatsFee = 0.0;
        double car7SeatsFee = 0.0;
        
        boolean hasVehicles = false;
        
        for (ApartmentResident apartmentResident : apartmentResidents) {
            Long residentUserId = apartmentResident.getId().getUserId();
            
            // Lấy danh sách xe của cư dân
            List<Vehicle> vehicles = vehicleRepository.findByUserId(residentUserId);
            
            for (Vehicle vehicle : vehicles) {
                // Chỉ tính phí cho xe máy và ô tô
                if (vehicle.getVehicleType() == VehicleType.MOTORCYCLE || 
                    vehicle.getVehicleType() == VehicleType.CAR_4_SEATS ||
                    vehicle.getVehicleType() == VehicleType.CAR_7_SEATS) {
                    
                    double monthlyFee = getVehicleFee(vehicle.getVehicleType(), config);
                    String vehicleType = vehicle.getVehicleType().getDisplayName();
                    
                    totalVehicleFee += monthlyFee;
                    hasVehicles = true;
                    
                    // Đếm số lượng từng loại xe
                    switch (vehicle.getVehicleType()) {
                        case MOTORCYCLE:
                            motorcycleCount++;
                            motorcycleFee += monthlyFee;
                            break;
                        case CAR_4_SEATS:
                            car4SeatsCount++;
                            car4SeatsFee += monthlyFee;
                            break;
                        case CAR_7_SEATS:
                            car7SeatsCount++;
                            car7SeatsFee += monthlyFee;
                            break;
                    }
                    
                    System.out.println("DEBUG: VehicleMonthlyFeeService - Xe " + vehicleType + " của cư dân " + residentUserId + 
                        " phí " + monthlyFee + " VND");
                }
            }
        }
        
        // Tạo mô tả chi tiết từng loại xe
        if (hasVehicles) {
            boolean firstItem = true;
            
            if (motorcycleCount > 0) {
                if (!firstItem) description.append(", ");
                description.append(motorcycleCount).append(" xe máy (").append(motorcycleFee).append(" VND)");
                firstItem = false;
            }
            
            if (car4SeatsCount > 0) {
                if (!firstItem) description.append(", ");
                description.append(car4SeatsCount).append(" ô tô 4 chỗ (").append(car4SeatsFee).append(" VND)");
                firstItem = false;
            }
            
            if (car7SeatsCount > 0) {
                if (!firstItem) description.append(", ");
                description.append(car7SeatsCount).append(" ô tô 7 chỗ (").append(car7SeatsFee).append(" VND)");
                firstItem = false;
            }
        } else {
            // Luôn hiển thị chi tiết từng loại xe, ngay cả khi không có xe
            description.append("0 xe máy (0 VND), 0 ô tô 4 chỗ (0 VND), 0 ô tô 7 chỗ (0 VND)");
        }
        
        System.out.println("DEBUG: VehicleMonthlyFeeService - Căn hộ " + apartmentId + 
            " tổng phí xe " + totalVehicleFee + " VND");
        System.out.println("DEBUG: VehicleMonthlyFeeService - Chi tiết: " + motorcycleCount + " xe máy, " + 
            car4SeatsCount + " ô tô 4 chỗ, " + car7SeatsCount + " ô tô 7 chỗ");

        // Thêm vào hóa đơn (luôn thêm, có thể là 0)
        try {
            invoiceService.addInvoiceItem(
                apartmentId,
                billingPeriod,
                "VEHICLE_FEE",
                description.toString(),
                BigDecimal.valueOf(totalVehicleFee)
            );
            System.out.println("DEBUG: VehicleMonthlyFeeService - Đã thêm phí xe cho căn hộ " + apartmentId + " với số tiền " + totalVehicleFee + " VND");
        } catch (Exception e) {
            System.err.println("DEBUG: VehicleMonthlyFeeService - Lỗi khi thêm phí xe cho căn hộ " + apartmentId + ": " + e.getMessage());
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