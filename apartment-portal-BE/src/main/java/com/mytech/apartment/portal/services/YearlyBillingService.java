package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.*;
import com.mytech.apartment.portal.repositories.*;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.models.enums.VehicleType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class YearlyBillingService {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;
    
    // Inject tất cả MonthlyFeeService
    @Autowired
    private List<MonthlyFeeService> feeServices;
    
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
     * Tạo hóa đơn đồng loạt cho tất cả căn hộ trong một tháng cụ thể
     * @param year Năm
     * @param month Tháng (1-12)
     */
    @Transactional
    public void generateMonthlyInvoicesForAllApartments(int year, int month) {
        System.out.println("DEBUG: Bắt đầu tạo hóa đơn đồng loạt cho tháng " + month + "/" + year);
        
        // 1. Lấy danh sách tất cả căn hộ hiện có
        List<Apartment> allApartments = apartmentRepository.findAll();
        System.out.println("DEBUG: Tìm thấy " + allApartments.size() + " căn hộ");
        
        // 2. Lấy cấu hình phí cho tháng (cache để tối ưu)
        Optional<ServiceFeeConfig> feeConfig = getFeeConfig(month, year);
        System.out.println("DEBUG: Cấu hình phí tháng " + month + "/" + year + ": " + (feeConfig.isPresent() ? "Có" : "Không có"));
        
        // 3. Tạo hóa đơn cho tất cả căn hộ trong tháng này
        String billingPeriod = String.format("%04d-%02d", year, month);
        System.out.println("DEBUG: Đang tạo hóa đơn cho kỳ " + billingPeriod);
        
        int successCount = 0;
        int skipCount = 0;
        int errorCount = 0;
        
        for (Apartment apartment : allApartments) {
            try {
                // Kiểm tra xem hóa đơn đã tồn tại chưa
                Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartment.getId(), billingPeriod);
                if (existingInvoice.isPresent()) {
                    System.out.println("DEBUG: Bỏ qua căn hộ " + apartment.getId() + " - hóa đơn đã tồn tại cho kỳ " + billingPeriod);
                    skipCount++;
                    continue;
                }
                
                // Tạo hóa đơn cho căn hộ này
                createInvoiceForApartment(apartment.getId(), billingPeriod, year, month);
                successCount++;
                
            } catch (Exception e) {
                System.err.println("ERROR: Lỗi khi tạo hóa đơn cho căn hộ " + apartment.getId() + ": " + e.getMessage());
                errorCount++;
            }
        }
        
        System.out.println("DEBUG: Hoàn thành tạo hóa đơn cho tháng " + month + "/" + year);
        System.out.println("DEBUG: Thống kê - Thành công: " + successCount + ", Bỏ qua: " + skipCount + ", Lỗi: " + errorCount);
    }

    /**
     * Tạo hóa đơn cho tất cả căn hộ trong một tháng cụ thể
     * @param year Năm
     * @param month Tháng (1-12)
     */
    @Transactional
    public void generateInvoicesForMonth(int year, int month) {
        // Gọi phương thức mới với tên rõ ràng hơn
        generateMonthlyInvoicesForAllApartments(year, month);
    }

    /**
     * Tạo hóa đơn cho một căn hộ cụ thể trong một kỳ thanh toán
     * SỬA LẠI: Sử dụng các MonthlyFeeService để tạo đầy đủ các loại phí
     */
    public void createInvoiceForApartment(Long apartmentId, String billingPeriod, int year, int month) {
        System.out.println("DEBUG: Bắt đầu tạo hóa đơn cho căn hộ " + apartmentId + " kỳ " + billingPeriod);
        
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
        System.out.println("DEBUG: Cấu hình phí tháng " + month + "/" + year + ": " + (feeConfig.isPresent() ? "Có" : "Không có"));
        
        // Tạo hóa đơn cơ bản với totalAmount = 0.01 (sẽ được tính lại sau)
        Invoice invoice = Invoice.builder()
            .apartmentId(apartmentId)
            .billingPeriod(billingPeriod)
            .issueDate(LocalDate.of(year, month, 1))
            .dueDate(LocalDate.of(year, month, 15))
            .status(InvoiceStatus.UNPAID)
            .totalAmount(0.01) // Đặt giá trị nhỏ > 0 để tránh vi phạm constraint
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        // Khởi tạo danh sách items
        invoice.setItems(new HashSet<>());
        
        // Lưu hóa đơn trước
        invoiceRepository.save(invoice);
        System.out.println("DEBUG: Đã tạo hóa đơn cơ bản cho căn hộ " + apartmentId + " kỳ " + billingPeriod);
        
        // SỬA LẠI: Sử dụng các MonthlyFeeService để tạo đầy đủ các loại phí
        System.out.println("DEBUG: Chạy các MonthlyFeeService để thêm chi tiết phí cho căn hộ " + apartmentId);
        feeServices.forEach(svc -> {
            try {
                System.out.println("DEBUG: Đang chạy " + svc.getClass().getSimpleName() + " cho căn hộ " + apartmentId);
                svc.generateFeeForMonth(billingPeriod, apartmentId);
                System.out.println("DEBUG: Hoàn thành " + svc.getClass().getSimpleName() + " cho căn hộ " + apartmentId);
            } catch (Exception e) {
                System.err.println("ERROR: Lỗi khi chạy " + svc.getClass().getSimpleName() + " cho căn hộ " + apartmentId + ": " + e.getMessage());
                e.printStackTrace();
            }
        });
        
        // Cập nhật tổng tiền từ các items
        updateInvoiceTotalFromItems(invoice.getId());
        
        // Debug: Kiểm tra số lượng chi tiết sau khi lưu
        Optional<Invoice> updatedInvoice = invoiceRepository.findById(invoice.getId());
        if (updatedInvoice.isPresent()) {
            Invoice finalInvoice = updatedInvoice.get();
            System.out.println("DEBUG: Hoàn thành tạo hóa đơn cho căn hộ " + apartmentId + " kỳ " + billingPeriod + 
                " với tổng tiền " + finalInvoice.getTotalAmount() + " và " + 
                (finalInvoice.getItems() != null ? finalInvoice.getItems().size() : 0) + " chi tiết");
            
            // Debug: In ra từng chi tiết
            if (finalInvoice.getItems() != null) {
                for (InvoiceItem item : finalInvoice.getItems()) {
                    System.out.println("DEBUG: Chi tiết - " + item.getFeeType() + ": " + item.getAmount() + " - " + item.getDescription());
                }
            }
        }
    }
    
    /**
     * Tính phí gửi xe (giữ lại để tham khảo, không sử dụng trong logic mới)
     */
    private double calculateParkingFee(Long apartmentId, int month, int year, Optional<ServiceFeeConfig> feeConfig) {
        // Lấy danh sách xe của tất cả cư dân trong căn hộ
        List<ApartmentResident> residents = apartmentResidentRepository.findByApartment_Id(apartmentId);
        double totalParkingFee = 0.0;
        
        for (ApartmentResident resident : residents) {
            List<Vehicle> vehicles = vehicleRepository.findByUserId(resident.getId().getUserId());
            
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
     * Tính phí nước (giữ lại để tham khảo, không sử dụng trong logic mới)
     */
    private double calculateWaterFee(Long apartmentId, int month, int year, Optional<ServiceFeeConfig> feeConfig) {
        // Tìm chỉ số nước của tháng hiện tại
        String currentMonth = String.format("%04d-%02d", year, month);
        System.out.println("DEBUG: Tìm chỉ số nước cho căn hộ " + apartmentId + " tháng " + currentMonth);
        
        // Lấy giá nước từ config hoặc dùng giá mặc định
        double waterFeePerM3 = feeConfig.isPresent() ? feeConfig.get().getWaterFeePerM3() : 15000.0;
        
        Optional<com.mytech.apartment.portal.models.WaterMeterReading> reading = 
            waterMeterReadingRepository.findByApartmentIdAndReadingMonth(apartmentId.intValue(), currentMonth);
        
        if (reading.isPresent()) {
            com.mytech.apartment.portal.models.WaterMeterReading r = reading.get();
            double consumption = r.getConsumption();
            System.out.println("DEBUG: Tìm thấy chỉ số nước: " + consumption + " m³");
            
            // Tính phí nước
            double waterFee = consumption * waterFeePerM3;
            System.out.println("DEBUG: Phí nước: " + waterFee + " VND");
            
            return waterFee;
        } else {
            System.out.println("DEBUG: Không tìm thấy chỉ số nước cho căn hộ " + apartmentId + " tháng " + currentMonth);
            return 0.0;
        }
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
     * Clear all cache (useful for testing or manual cache invalidation)
     */
    public void clearCache() {
        configCache.clear();
        cacheTimestamps.clear();
        System.out.println("DEBUG: Cache cleared");
    }
    
    /**
     * Tính lại tổng tiền hóa đơn từ các items
     * @param invoice Hóa đơn cần tính lại
     * @return Tổng tiền mới
     */
    public double recalculateInvoiceTotal(Invoice invoice) {
        if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
            return 0.0;
        }
        
        double totalAmount = invoice.getItems().stream()
            .mapToDouble(InvoiceItem::getAmount)
            .sum();
        
        System.out.println("DEBUG: Tính lại tổng tiền hóa đơn " + invoice.getId() + ": " + totalAmount);
        return totalAmount;
    }
    
    /**
     * Cập nhật tổng tiền hóa đơn từ các items
     * @param invoiceId ID hóa đơn cần cập nhật
     */
    @Transactional
    public void updateInvoiceTotalFromItems(Long invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isEmpty()) {
            System.out.println("DEBUG: Không tìm thấy hóa đơn " + invoiceId);
            return;
        }
        
        Invoice invoice = invoiceOpt.get();
        double newTotal = recalculateInvoiceTotal(invoice);
        
        // Cập nhật tổng tiền
        invoice.setTotalAmount(newTotal);
        invoice.setUpdatedAt(LocalDateTime.now());
        invoiceRepository.save(invoice);
        
        System.out.println("DEBUG: Đã cập nhật tổng tiền hóa đơn " + invoiceId + " thành " + newTotal);
    }
    
    /**
     * Cập nhật tổng tiền cho tất cả hóa đơn trong một kỳ thanh toán
     * @param billingPeriod Kỳ thanh toán (format: YYYY-MM)
     */
    @Transactional
    public void updateAllInvoiceTotalsForPeriod(String billingPeriod) {
        List<Invoice> invoices = invoiceRepository.findByBillingPeriod(billingPeriod);
        System.out.println("DEBUG: Tìm thấy " + invoices.size() + " hóa đơn cho kỳ " + billingPeriod);
        
        int updatedCount = 0;
        for (Invoice invoice : invoices) {
            double newTotal = recalculateInvoiceTotal(invoice);
            if (Math.abs(newTotal - invoice.getTotalAmount()) > 0.01) { // Cho phép sai số nhỏ do floating point
                invoice.setTotalAmount(newTotal);
                invoice.setUpdatedAt(LocalDateTime.now());
                invoiceRepository.save(invoice);
                updatedCount++;
                System.out.println("DEBUG: Cập nhật hóa đơn " + invoice.getId() + " từ " + invoice.getTotalAmount() + " thành " + newTotal);
            }
        }
        
        System.out.println("DEBUG: Đã cập nhật " + updatedCount + " hóa đơn cho kỳ " + billingPeriod);
    }
    
    /**
     * Kiểm tra và sửa lỗi tổng tiền hóa đơn cho một tháng
     * @param year Năm
     * @param month Tháng (1-12)
     */
    @Transactional
    public void validateAndFixInvoiceTotals(int year, int month) {
        String billingPeriod = String.format("%04d-%02d", year, month);
        System.out.println("DEBUG: Kiểm tra và sửa lỗi tổng tiền hóa đơn cho kỳ " + billingPeriod);
        
        List<Invoice> invoices = invoiceRepository.findByBillingPeriod(billingPeriod);
        int fixedCount = 0;
        int correctCount = 0;
        
        for (Invoice invoice : invoices) {
            double calculatedTotal = recalculateInvoiceTotal(invoice);
            double storedTotal = invoice.getTotalAmount();
            
            if (Math.abs(calculatedTotal - storedTotal) > 0.01) { // Cho phép sai số nhỏ do floating point
                System.out.println("DEBUG: Phát hiện lỗi tổng tiền hóa đơn " + invoice.getId() + 
                    " - Lưu trữ: " + storedTotal + ", Tính toán: " + calculatedTotal);
                
                invoice.setTotalAmount(calculatedTotal);
                invoice.setUpdatedAt(LocalDateTime.now());
                invoiceRepository.save(invoice);
                fixedCount++;
            } else {
                correctCount++;
            }
        }
        
        System.out.println("DEBUG: Kết quả kiểm tra - Đúng: " + correctCount + ", Đã sửa: " + fixedCount);
    }
} 