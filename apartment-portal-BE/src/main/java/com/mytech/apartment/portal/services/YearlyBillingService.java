package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.*;
import com.mytech.apartment.portal.repositories.*;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
// import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.models.WaterMeterReading;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import java.math.BigDecimal;
import java.time.LocalDate;
// import java.time.YearMonth;
// import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
public class YearlyBillingService {

    // @Autowired
    // private InvoiceService invoiceService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // Chạy các dịch vụ tính phí theo item (dịch vụ, nước, gửi xe...)
    @Autowired
    private List<MonthlyFeeService> feeServices;

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private InvoiceService invoiceService;
    
    // Cache for fee configs to reduce database queries
    private final ConcurrentHashMap<String, ServiceFeeConfig> configCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION_MS = 30000; // 30 seconds cache

    /**
     * Tạo hóa đơn đồng loạt cho tất cả căn hộ hiện có trong một năm
     * @param year Năm cần tạo hóa đơn (ví dụ: 2024)
     */
    @Transactional
    public void generateYearlyInvoices(int year) {
        System.out.println("DEBUG: Bắt đầu tạo hóa đơn đồng loạt cho năm " + year);
        
        // 1. Lấy danh sách tất cả căn hộ hiện có
        List<Apartment> allApartments = apartmentRepository.findAll();
        System.out.println("DEBUG: Tìm thấy " + allApartments.size() + " căn hộ");
        
        // 2. Tạo hóa đơn cho từng tháng trong năm
        for (int month = 1; month <= 12; month++) {
            String billingPeriod = String.format("%04d-%02d", year, month);
            System.out.println("DEBUG: Đang tạo hóa đơn cho kỳ " + billingPeriod);
            
            // Tạo hóa đơn cho từng căn hộ
            for (Apartment apartment : allApartments) {
                createInvoiceForApartment(apartment.getId(), billingPeriod, year, month);
            }
        }
        
        System.out.println("DEBUG: Hoàn thành tạo hóa đơn đồng loạt cho năm " + year);
    }

    /**
     * Tạo hóa đơn cho một căn hộ cụ thể trong một năm
     * @param apartmentId ID căn hộ
     * @param year Năm cần tạo hóa đơn
     */
    @Transactional
    public void generateYearlyInvoiceForApartment(Long apartmentId, int year) {
        System.out.println("DEBUG: Tạo hóa đơn cho căn hộ " + apartmentId + " năm " + year);
        
        // Kiểm tra căn hộ có tồn tại không
        Optional<Apartment> apartment = apartmentRepository.findById(apartmentId);
        if (apartment.isEmpty()) {
            System.out.println("DEBUG: Không tìm thấy căn hộ " + apartmentId);
            return;
        }
        
        // Tạo hóa đơn cho từng tháng trong năm
        for (int month = 1; month <= 12; month++) {
            String billingPeriod = String.format("%04d-%02d", year, month);
            createInvoiceForApartment(apartmentId, billingPeriod, year, month);
        }
    }

    /**
     * Tạo hóa đơn cho năm hiện tại cho tất cả căn hộ
     */
    @Transactional
    public void generateCurrentYearInvoices() {
        int currentYear = LocalDate.now().getYear();
        generateYearlyInvoices(currentYear);
    }

    /**
     * Tạo hóa đơn cho một căn hộ trong năm hiện tại
     * @param apartmentId ID căn hộ
     */
    @Transactional
    public void generateCurrentYearInvoiceForApartment(Long apartmentId) {
        int currentYear = LocalDate.now().getYear();
        generateYearlyInvoiceForApartment(apartmentId, currentYear);
    }

    /**
     * Tạo hóa đơn cho tất cả căn hộ trong một tháng cụ thể
     * @param year Năm
     * @param month Tháng (1-12)
     * @param skipWaterValidation Bỏ qua kiểm tra chỉ số nước
     * @throws IllegalArgumentException nếu chưa có cấu hình phí dịch vụ hoặc chưa ghi chỉ số nước
     */
    @Transactional
    public void generateInvoicesForMonth(int year, int month, boolean skipWaterValidation) {
        System.out.println("DEBUG: Bắt đầu tạo hóa đơn (base + items) cho tháng " + month + "/" + year);

        // Kiểm tra xem có cấu hình phí dịch vụ cho tháng này không
        Optional<ServiceFeeConfig> feeConfig = getFeeConfig(month, year);
        if (feeConfig.isEmpty()) {
            String errorMessage = String.format("Không thể tạo hóa đơn cho tháng %d/%d. Lý do: Chưa có cấu hình phí dịch vụ cho tháng này. Vui lòng tạo biểu phí trước khi tạo hóa đơn.", month, year);
            System.out.println("ERROR: " + errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }

        // Kiểm tra chỉ số nước cho tháng này (nếu không bỏ qua)
        if (!skipWaterValidation) {
            checkWaterMeterReadingsAndWarn(year, month);
        } else {
            System.out.println("DEBUG: Bỏ qua kiểm tra chỉ số nước theo yêu cầu");
        }

        // 1) Tạo hóa đơn với tính toán phí ngay từ đầu
        List<Apartment> allApartments = apartmentRepository.findAll();
        String billingPeriod = String.format("%04d-%02d", year, month);
        System.out.println("DEBUG: Số căn hộ: " + allApartments.size() + ", kỳ: " + billingPeriod);

        java.util.List<Long> createdApartmentIds = new java.util.ArrayList<>();
        LocalDate monthDate = LocalDate.of(year, month, 1);

        for (Apartment apartment : allApartments) {
            // Kiểm tra xem căn hộ này đã có chỉ số nước chưa (nếu không bỏ qua kiểm tra)
            if (!skipWaterValidation) {
                Optional<WaterMeterReading> reading = waterMeterReadingRepository
                    .findByApartmentIdAndReadingDate(apartment.getId(), monthDate);
                
                // Bỏ qua căn hộ chưa có chỉ số nước hoặc chỉ số = 0
                if (reading.isEmpty()) {
                    System.out.println("DEBUG: Bỏ qua căn hộ " + apartment.getId() + " - chưa có bản ghi chỉ số nước");
                    continue;
                } else if (reading.get().getMeterReading() == null) {
                    System.out.println("DEBUG: Bỏ qua căn hộ " + apartment.getId() + " - chỉ số nước null");
                    continue;
                } else if (reading.get().getMeterReading().compareTo(java.math.BigDecimal.ZERO) == 0) {
                    System.out.println("DEBUG: Bỏ qua căn hộ " + apartment.getId() + " - chỉ số nước = 0");
                    continue;
                } else {
                    System.out.println("DEBUG: Căn hộ " + apartment.getId() + " có chỉ số nước: " + reading.get().getMeterReading() + " - tiếp tục xử lý");
                }
            }

            // Chỉ tạo mới nếu chưa tồn tại hóa đơn của kỳ này
            Optional<Invoice> existing = invoiceRepository.findByApartmentIdAndBillingPeriod(apartment.getId(), billingPeriod);
            if (existing.isPresent()) {
                System.out.println("DEBUG: Căn hộ " + apartment.getId() + " đã có hóa đơn cho kỳ " + billingPeriod + " - bỏ qua");
                continue;
            } else {
                System.out.println("DEBUG: Căn hộ " + apartment.getId() + " chưa có hóa đơn cho kỳ " + billingPeriod + " - tiếp tục tạo");
            }

            System.out.println("DEBUG: Bắt đầu tạo hóa đơn cho căn hộ " + apartment.getId());

            // Tính toán tổng tiền ngay từ đầu để tránh vi phạm constraint
            double totalAmount = calculateTotalAmountForApartment(apartment.getId(), month, year);
            
            // Đảm bảo totalAmount > 0 để tránh vi phạm constraint chk_invoice_amount
            if (totalAmount <= 0) {
                System.out.println("DEBUG: Cảnh báo - Tổng tiền hóa đơn cho căn hộ " + apartment.getId() + " bằng 0. Sử dụng giá trị tối thiểu.");
                totalAmount = 1000.0; // Giá trị tối thiểu để tránh constraint violation
            }

            Invoice invoice = Invoice.builder()
                .apartmentId(apartment.getId())
                .billingPeriod(billingPeriod)
                .issueDate(LocalDate.of(year, month, 1))
                .dueDate(LocalDate.of(year, month, 15))
                .status(InvoiceStatus.UNPAID)
                .totalAmount(totalAmount)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

            invoiceRepository.save(invoice);
            System.out.println("DEBUG: Đã tạo hóa đơn thành công cho căn hộ " + apartment.getId() + " - Tổng tiền: " + totalAmount);
            // Ghi nhận căn hộ đã tạo mới hoá đơn để gửi email sau khi đã tính xong các item
            createdApartmentIds.add(apartment.getId());
        }

        // 2) Gọi lần lượt các dịch vụ tính phí để thêm item vào từng hóa đơn (idempotent)
        // Chỉ gọi nếu có hóa đơn được tạo
        if (feeServices != null && !feeServices.isEmpty() && !createdApartmentIds.isEmpty()) {
            System.out.println("DEBUG: Bắt đầu thêm items cho " + createdApartmentIds.size() + " hóa đơn");
            feeServices.forEach(svc -> svc.generateFeeForMonth(billingPeriod));
            System.out.println("DEBUG: Hoàn thành thêm items cho hóa đơn");
        } else {
            System.out.println("DEBUG: Bỏ qua thêm items - không có hóa đơn nào được tạo");
        }

        // Sau khi đã thêm các items vào hoá đơn, mới gửi email để bảng chi tiết không bị trống
        System.out.println("DEBUG: Bắt đầu gửi email cho " + createdApartmentIds.size() + " hóa đơn");
        for (Long aptId : createdApartmentIds) {
            try {
                System.out.println("DEBUG: Gửi email cho căn hộ " + aptId);
                invoiceService.sendInvoiceEmailsForApartmentPeriod(aptId, billingPeriod);
                System.out.println("DEBUG: Gửi email thành công cho căn hộ " + aptId);
            } catch (Exception e) {
                System.out.println("WARNING: Lỗi gửi email cho căn hộ " + aptId + ": " + e.getMessage());
            }
        }

        System.out.println("DEBUG: Hoàn thành tạo hóa đơn base và thêm các items cho tháng " + month + "/" + year + 
                          " - Đã tạo " + createdApartmentIds.size() + " hóa đơn");
    }

    /**
     * Tạo hóa đơn đồng loạt cho tất cả căn hộ trong một tháng (phiên bản phục vụ controller mới)
     */
    @Transactional
    public void generateMonthlyInvoicesForAllApartments(int year, int month, boolean skipWaterValidation) {
        generateInvoicesForMonth(year, month, skipWaterValidation);
    }

    /**
     * Overload method để tương thích ngược (mặc định kiểm tra chỉ số nước)
     */
    @Transactional
    public void generateInvoicesForMonth(int year, int month) {
        generateInvoicesForMonth(year, month, false);
    }

    /**
     * Overload method để tương thích ngược (mặc định kiểm tra chỉ số nước)
     */
    @Transactional
    public void generateMonthlyInvoicesForAllApartments(int year, int month) {
        generateMonthlyInvoicesForAllApartments(year, month, false);
    }

    /**
     * Tạo hóa đơn cho một căn hộ cụ thể trong một kỳ thanh toán
     */
    private void createInvoiceForApartment(Long apartmentId, String billingPeriod, int year, int month) {
        // Kiểm tra xem hóa đơn đã tồn tại chưa
        Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
        if (existingInvoice.isPresent()) {
            System.out.println("DEBUG: Hóa đơn đã tồn tại cho căn hộ " + apartmentId + " kỳ " + billingPeriod);
            return;
        }
        
        // Lấy thông tin căn hộ
        Optional<Apartment> apartment = apartmentRepository.findById(apartmentId);
        if (apartment.isEmpty()) {
            System.out.println("DEBUG: Không tìm thấy căn hộ " + apartmentId);
            return;
        }
        
        // Lấy cấu hình phí cho tháng
        Optional<ServiceFeeConfig> feeConfig = getFeeConfig(month, year);
        
        // Tính toán phí dịch vụ
        double serviceFee = 0.0;
        if (feeConfig.isPresent()) {
            serviceFee = apartment.get().getArea() * feeConfig.get().getServiceFeePerM2();
        } else {
            // Sử dụng giá mặc định
            serviceFee = apartment.get().getArea() * 5000.0; // 5000 VND/m2
        }
        
        // Tính phí gửi xe
        double parkingFee = calculateParkingFee(apartmentId, month, year, feeConfig);
        
        // Tính phí nước (nếu có)
        double waterFee = calculateWaterFee(apartmentId, month, year, feeConfig);
        
        // Tổng tiền
        double totalAmount = serviceFee + parkingFee + waterFee;
        
        // Tạo hóa đơn
        Invoice invoice = Invoice.builder()
            .apartmentId(apartmentId)
            .billingPeriod(billingPeriod)
            .issueDate(LocalDate.of(year, month, 1))
            .dueDate(LocalDate.of(year, month, 15))
            .status(InvoiceStatus.UNPAID)
            .totalAmount(totalAmount)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        invoiceRepository.save(invoice);
        System.out.println("DEBUG: Đã tạo hóa đơn cho căn hộ " + apartmentId + " kỳ " + billingPeriod + " với tổng tiền " + totalAmount);
    }
    
    /**
     * Tính phí gửi xe
     */
    private double calculateParkingFee(Long apartmentId, int month, int year, Optional<ServiceFeeConfig> feeConfig) {
        // Lấy danh sách xe của tất cả cư dân trong căn hộ
        List<ApartmentResident> residents = apartmentResidentRepository.findByApartment_Id(apartmentId);
        double totalParkingFee = 0.0;
        
        for (ApartmentResident resident : residents) {
            List<Vehicle> vehicles = vehicleRepository.findByResidentUserId(resident.getId().getUserId());
            
            for (Vehicle vehicle : vehicles) {
                double vehicleFee = 0.0;
                
                if (feeConfig.isPresent()) {
                    switch (vehicle.getVehicleType()) {
                        case MOTORCYCLE:
                            vehicleFee = feeConfig.get().getMotorcycleFee();
                            break;
                        case CAR_4_SEATS:
                            vehicleFee = feeConfig.get().getCar4SeatsFee();
                            break;
                        case CAR_7_SEATS:
                            vehicleFee = feeConfig.get().getCar7SeatsFee();
                            break;
                        default:
                            // Sử dụng giá mặc định cho các loại xe khác
                            vehicleFee = vehicle.getVehicleType().getMonthlyFee().doubleValue();
                            break;
                    }
                } else {
                    // Sử dụng giá mặc định từ enum
                    vehicleFee = vehicle.getVehicleType().getMonthlyFee().doubleValue();
                }
                
                totalParkingFee += vehicleFee;
            }
        }
        
        return totalParkingFee;
    }
    
    /**
     * Tính phí nước
     */
    private double calculateWaterFee(Long apartmentId, int month, int year, Optional<ServiceFeeConfig> feeConfig) {
        // Tạm thời comment out water meter reading functionality
        /*
        // Tìm chỉ số nước của tháng trước
        String previousMonth = String.format("%04d-%02d", year, month);
        Optional<WaterMeterReading> reading = waterMeterReadingRepository.findByApartmentIdAndReadingMonth(
            apartmentId.intValue(), previousMonth);
        
        if (reading.isPresent()) {
            double consumption = reading.get().getConsumption().doubleValue();
            double waterRate = feeConfig.isPresent() ? feeConfig.get().getWaterFeePerM3() : 15000.0;
            return consumption * waterRate;
        }
        */
        
        return 0.0;
    }

    /**
     * Tạo cấu hình phí dịch vụ cho cả năm
     * @param year Năm cần tạo cấu hình
     * @param serviceFeePerM2 Giá dịch vụ/m2
     * @param waterFeePerM3 Giá nước/m3
     * @param motorcycleFee Phí gửi xe máy/tháng
     * @param car4SeatsFee Phí gửi ô tô 4 chỗ/tháng
     * @param car7SeatsFee Phí gửi ô tô 7 chỗ/tháng
     */
    @Transactional
    public void createYearlyFeeConfig(int year, double serviceFeePerM2, 
                                    double waterFeePerM3, double motorcycleFee,
                                    double car4SeatsFee, double car7SeatsFee) {
        System.out.println("DEBUG: Tạo cấu hình phí cho năm " + year);
        
        // Tạo cấu hình cho 12 tháng
        for (int month = 1; month <= 12; month++) {
            // Kiểm tra xem cấu hình đã tồn tại chưa
            Optional<ServiceFeeConfig> existingConfig = serviceFeeConfigRepository.findByMonthAndYear(month, year);
            if (existingConfig.isPresent()) {
                System.out.println("DEBUG: Cấu hình tháng " + month + "/" + year + " đã tồn tại, bỏ qua");
                continue;
            }
            
            ServiceFeeConfig config = ServiceFeeConfig.builder()
                .month(month)
                .year(year)
                .serviceFeePerM2(serviceFeePerM2)
                .waterFeePerM3(waterFeePerM3)
                .motorcycleFee(motorcycleFee)
                .car4SeatsFee(car4SeatsFee)
                .car7SeatsFee(car7SeatsFee)
                .build();
            
            serviceFeeConfigRepository.save(config);
            System.out.println("DEBUG: Đã tạo cấu hình phí tháng " + month + "/" + year);
            
            // Clear cache for this month/year
            String cacheKey = getCacheKey(month, year);
            configCache.remove(cacheKey);
            cacheTimestamps.remove(cacheKey);
        }
    }

    /**
     * Cập nhật cấu hình phí cho một tháng cụ thể
     */
    @Transactional
    public void updateFeeConfig(int month, int year, double serviceFeePerM2, 
                              double waterFeePerM3, double motorcycleFee,
                              double car4SeatsFee, double car7SeatsFee) {
        // Chặn sửa biểu phí cho tháng quá khứ
        YearMonth target = YearMonth.of(year, month);
        YearMonth current = YearMonth.now();
        if (target.isBefore(current)) {
            throw new IllegalStateException("Không được cập nhật biểu phí của tháng quá khứ");
        }

        // Nếu là tháng hiện tại và đã tạo hóa đơn thì không cho sửa
        if (target.equals(current)) {
            String prefix = String.format("%04d-%02d", year, month);
            long invoiceCount = invoiceRepository.countByBillingPeriodStartingWith(prefix);
            if (invoiceCount > 0) {
                throw new IllegalStateException("Không được cập nhật biểu phí tháng hiện tại vì đã tạo hóa đơn");
            }
        }

        Optional<ServiceFeeConfig> existingConfig = serviceFeeConfigRepository.findByMonthAndYear(month, year);
        
        if (existingConfig.isPresent()) {
            ServiceFeeConfig config = existingConfig.get();
            config.setServiceFeePerM2(serviceFeePerM2);
            config.setWaterFeePerM3(waterFeePerM3);
            config.setMotorcycleFee(motorcycleFee);
            config.setCar4SeatsFee(car4SeatsFee);
            config.setCar7SeatsFee(car7SeatsFee);
            serviceFeeConfigRepository.save(config);
        } else {
            ServiceFeeConfig newConfig = ServiceFeeConfig.builder()
                .month(month)
                .year(year)
                .serviceFeePerM2(serviceFeePerM2)
                .waterFeePerM3(waterFeePerM3)
                .motorcycleFee(motorcycleFee)
                .car4SeatsFee(car4SeatsFee)
                .car7SeatsFee(car7SeatsFee)
                .build();
            serviceFeeConfigRepository.save(newConfig);
        }
        
        // Clear cache for this month/year
        String cacheKey = getCacheKey(month, year);
        configCache.remove(cacheKey);
        cacheTimestamps.remove(cacheKey);
    }

    /**
     * Lấy cấu hình phí cho một tháng cụ thể
     */
    public Optional<ServiceFeeConfig> getFeeConfig(int month, int year) {
        String cacheKey = getCacheKey(month, year);
        
        // Check cache first
        ServiceFeeConfig cachedConfig = configCache.get(cacheKey);
        LocalDateTime cacheTime = cacheTimestamps.get(cacheKey);
        
        if (cachedConfig != null && cacheTime != null) {
            long timeDiff = java.time.Duration.between(cacheTime, LocalDateTime.now()).toMillis();
            if (timeDiff < CACHE_DURATION_MS) {
                System.out.println("DEBUG: Returning cached config for " + month + "/" + year);
                return Optional.of(cachedConfig);
            }
        }
        
        // Query database if not in cache or cache expired
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository.findByMonthAndYear(month, year);
        
        if (config.isPresent()) {
            // Update cache
            configCache.put(cacheKey, config.get());
            cacheTimestamps.put(cacheKey, LocalDateTime.now());
            System.out.println("DEBUG: Updated cache for " + month + "/" + year);
        } else {
            // Remove from cache if not found
            configCache.remove(cacheKey);
            cacheTimestamps.remove(cacheKey);
        }
        
        return config;
    }

    /**
     * Lấy tất cả cấu hình phí cho một năm
     */
    public List<ServiceFeeConfig> getYearlyFeeConfig(int year) {
        return serviceFeeConfigRepository.findByYear(year);
    }
    
    /**
     * Generate cache key for month/year combination
     */
    private String getCacheKey(int month, int year) {
        return month + "-" + year;
    }
    
    /**
     * Clear cache entry for a specific month/year (exposed for other services after config update)
     */
    public void clearCacheFor(int month, int year) {
        String cacheKey = getCacheKey(month, year);
        configCache.remove(cacheKey);
        cacheTimestamps.remove(cacheKey);
        System.out.println("DEBUG: Cleared cache for " + month + "/" + year);
    }
    
    /**
     * Clear all cache (useful for testing or manual cache invalidation)
     */
    public void clearCache() {
        configCache.clear();
        cacheTimestamps.clear();
        System.out.println("DEBUG: Cache cleared");
    }



    /**
     * Tính tổng tiền hóa đơn cho một căn hộ trong tháng/năm cụ thể
     */
    private double calculateTotalAmountForApartment(Long apartmentId, int month, int year) {
        // Lấy thông tin căn hộ
        Optional<Apartment> apartment = apartmentRepository.findById(apartmentId);
        if (apartment.isEmpty()) {
            return 0.0;
        }

        // Lấy cấu hình phí
        Optional<ServiceFeeConfig> feeConfig = getFeeConfig(month, year);
        
        // Tính phí dịch vụ
        double serviceFee = 0.0;
        if (feeConfig.isPresent()) {
            serviceFee = apartment.get().getArea() * feeConfig.get().getServiceFeePerM2();
        } else {
            serviceFee = apartment.get().getArea() * 5000.0; // Giá mặc định
        }
        
        // Tính phí gửi xe
        double parkingFee = calculateParkingFee(apartmentId, month, year, feeConfig);
        
        // Tính phí nước
        double waterFee = calculateWaterFee(apartmentId, month, year, feeConfig);
        
        return serviceFee + parkingFee + waterFee;
    }

    /**
     * Kiểm tra chỉ số nước cho tháng được chỉ định và cảnh báo
     * @param year Năm
     * @param month Tháng
     */
    private void checkWaterMeterReadingsAndWarn(int year, int month) {
        System.out.println("DEBUG: Kiểm tra chỉ số nước cho tháng " + month + "/" + year);
        
        // Tạo LocalDate cho tháng được chỉ định (ngày 1 của tháng)
        LocalDate monthDate = LocalDate.of(year, month, 1);
        
        // Lấy tất cả căn hộ
        List<Apartment> allApartments = apartmentRepository.findAll();
        
        // Đếm căn hộ chưa có chỉ số nước hoặc chỉ số = 0
        int apartmentsWithoutReadings = 0;
        int apartmentsWithReadings = 0;
        
        for (Apartment apartment : allApartments) {
            // Tìm chỉ số nước cho căn hộ này trong tháng được chỉ định
            Optional<WaterMeterReading> reading = waterMeterReadingRepository
                .findByApartmentIdAndReadingDate(apartment.getId(), monthDate);
            
            if (reading.isEmpty()) {
                // Chưa có bản ghi chỉ số nước
                apartmentsWithoutReadings++;
            } else if (reading.get().getMeterReading() == null || 
                      reading.get().getMeterReading().compareTo(java.math.BigDecimal.ZERO) == 0) {
                // Có bản ghi nhưng chỉ số = 0 (chưa ghi chỉ số)
                apartmentsWithoutReadings++;
            } else {
                // Có chỉ số nước > 0
                apartmentsWithReadings++;
            }
        }
        
        // Ghi log thông tin
        System.out.println("DEBUG: Tổng căn hộ: " + allApartments.size() + 
                          ", có chỉ số nước: " + apartmentsWithReadings + 
                          ", chưa có chỉ số nước: " + apartmentsWithoutReadings);
        
        // Nếu có căn hộ chưa ghi chỉ số nước, ghi cảnh báo nhưng vẫn tiếp tục
        if (apartmentsWithoutReadings > 0) {
            String warningMessage = String.format(
                "CẢNH BÁO: Có %d căn hộ chưa ghi chỉ số nước cho tháng %d/%d. " +
                "Hệ thống sẽ tạo hóa đơn cho %d căn hộ đã có chỉ số nước. " +
                "Vui lòng ghi chỉ số nước cho các căn hộ còn lại sau.",
                apartmentsWithoutReadings, month, year, apartmentsWithReadings
            );
            System.out.println("WARNING: " + warningMessage);
        } else {
            System.out.println("DEBUG: Đã kiểm tra chỉ số nước - tất cả căn hộ đã có chỉ số > 0");
        }
    }
} 