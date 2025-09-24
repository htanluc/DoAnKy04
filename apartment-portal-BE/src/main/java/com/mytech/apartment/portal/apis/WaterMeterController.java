package com.mytech.apartment.portal.apis;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.services.WaterMeterService;
import com.mytech.apartment.portal.services.EmailService;
import com.mytech.apartment.portal.services.InvoiceService;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.RoleRepository;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.enums.RelationType;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.UserStatus;
import com.mytech.apartment.portal.models.Role;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Set;

@RestController
@RequestMapping("/api")
@Validated
public class WaterMeterController {

    private final WaterMeterService waterMeterService;
    private final EmailService emailService;
    private final InvoiceService invoiceService;
    private final ApartmentResidentRepository apartmentResidentRepository;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final RoleRepository roleRepository;

    public WaterMeterController(WaterMeterService waterMeterService, EmailService emailService, InvoiceService invoiceService,
                               ApartmentResidentRepository apartmentResidentRepository, UserRepository userRepository,
                               ApartmentRepository apartmentRepository, RoleRepository roleRepository) {
        this.waterMeterService = waterMeterService;
        this.emailService = emailService;
        this.invoiceService = invoiceService;
        this.apartmentResidentRepository = apartmentResidentRepository;
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
        this.roleRepository = roleRepository;
    }

    // 1. Create or Update (upsert) via POST (tương tự addReading)
    @PostMapping("/admin/water-readings")
    public ResponseEntity<WaterMeterReadingDto> createOrUpdateReading(
            @Valid @RequestBody WaterMeterReadingDto dto
    ) {
        WaterMeterReadingDto saved = waterMeterService.addReading(dto);
        return ResponseEntity.ok(saved);
    }

    // 2. Read all readings
    @GetMapping("/admin/water-readings")
    public ResponseEntity<List<WaterMeterReadingDto>> listAll() {
        return ResponseEntity.ok(waterMeterService.getAllReadings());
    }

    // 2.1. Read readings by specific month
    @GetMapping("/admin/water-readings/by-month")
    public ResponseEntity<List<WaterMeterReadingDto>> getReadingsByMonth(
            @RequestParam("month") String month
    ) {
        return ResponseEntity.ok(waterMeterService.getReadingsByMonth(month));
    }

    // 2.2. Read latest readings for each apartment (optimized for dashboard)
    @GetMapping("/admin/water-readings/latest")
    public ResponseEntity<List<WaterMeterReadingDto>> getLatestReadings() {
        return ResponseEntity.ok(waterMeterService.getLatestReadings());
    }

    // 3. Read one by ID
    @GetMapping("/admin/water-readings/{id}")
    public ResponseEntity<WaterMeterReadingDto> getById(@PathVariable("id") Long id) {
        return waterMeterService.getReadingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Full replace via PUT
    @PutMapping("/admin/water-readings/{id}")
    public ResponseEntity<WaterMeterReadingDto> replaceReading(
            @PathVariable("id") Long id,
            @Valid @RequestBody WaterMeterReadingDto dto
    ) {
        WaterMeterReadingDto updated = waterMeterService.updateReading(id, dto);
        return ResponseEntity.ok(updated);
    }

    // 5. Partial update via PATCH
    @PatchMapping("/admin/water-readings/{id}")
    public ResponseEntity<WaterMeterReadingDto> patchReading(@PathVariable("id") Long id,
            @RequestBody Map<String, Object> updates
    ) {
        WaterMeterReadingDto patched = waterMeterService.patchReading(id, updates);
        return ResponseEntity.ok(patched);
    }

    // 6. Delete by ID
    @DeleteMapping("/admin/water-readings/{id}")
    public ResponseEntity<Void> deleteReading(@PathVariable("id") Long id) {
        waterMeterService.deleteReading(id);
        return ResponseEntity.noContent().build();
    }

    // 7. Generate readings for a new month
    @PostMapping("/admin/water-readings/generate")
    public ResponseEntity<Map<String, String>> generateReadings(@RequestParam("startMonth") String startMonth) {
        try {
            waterMeterService.generateHistory(startMonth);
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã tạo chỉ số nước cho tháng " + startMonth
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false", 
                "error", e.getMessage()
            ));
        }
    }

    // 7.1. Force create sample water readings (for testing)
    @PostMapping("/admin/water-readings/create-sample")
    public ResponseEntity<Map<String, String>> createSampleReadings() {
        try {
            waterMeterService.createSampleReadings();
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã tạo dữ liệu chỉ số nước mẫu"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false", 
                "error", e.getMessage()
            ));
        }
    }

    // 8. STAFF: Lookup latest by apartmentCode (unitNumber)
    @GetMapping("/staff/water-readings/lookup")
    public ResponseEntity<?> lookupByApartmentCode(@RequestParam("apartmentCode") String apartmentCode) {
        try {
            var data = waterMeterService.lookupByApartmentCode(apartmentCode);
            return ResponseEntity.ok(Map.of("success", true, "message", "OK", "data", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage(), "data", null));
        }
    }

    // 9. STAFF: Submit reading by apartmentCode
    @PostMapping("/staff/water-readings")
    public ResponseEntity<?> staffSubmit(@RequestBody Map<String, Object> body) {
        try {
            String code = String.valueOf(body.get("apartmentCode"));
            Number readingNum = (Number) body.get("currentReading");
            java.time.LocalDate date = null;
            Object readingAt = body.get("readingAt");
            if (readingAt instanceof String s && s.length() >= 10) {
                date = java.time.LocalDate.parse(s.substring(0,10));
            }
            var dto = waterMeterService.createFromApartmentCode(code,
                readingNum != null ? new java.math.BigDecimal(readingNum.toString()) : null,
                date);
            return ResponseEntity.ok(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 10. Test email functionality
    @PostMapping("/admin/test-email")
    public ResponseEntity<?> testEmail(@RequestParam("email") String email) {
        try {
            String subject = "Test Email - Hệ thống quản lý căn hộ";
            String html = "<h2>Test Email</h2><p>Email này được gửi để kiểm tra chức năng gửi email.</p>";
            
            emailService.sendHtmlEmail(email, subject, html);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email test đã được gửi tới " + email
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi gửi email test: " + e.getMessage()
            ));
        }
    }

    // 11. Check apartment residents data
    @GetMapping("/admin/check-residents")
    public ResponseEntity<?> checkResidents() {
        try {
            // Count total residents
            long totalResidents = apartmentResidentRepository.count();
            
            // Count residents with email
            List<com.mytech.apartment.portal.models.ApartmentResident> allResidents = apartmentResidentRepository.findAll();
            long residentsWithEmail = allResidents.stream()
                .map(ar -> userRepository.findById(ar.getId().getUserId()))
                .filter(opt -> opt.isPresent())
                .map(opt -> opt.get().getEmail())
                .filter(email -> email != null && !email.isBlank())
                .count();
            
            // Sample data
            List<Map<String, Object>> sampleData = allResidents.stream()
                .limit(5)
                .map(ar -> {
                    Map<String, Object> data = new java.util.HashMap<>();
                    data.put("apartmentId", ar.getId().getApartmentId());
                    data.put("userId", ar.getId().getUserId());
                    data.put("isPrimary", ar.getIsPrimaryResident());
                    
                    userRepository.findById(ar.getId().getUserId()).ifPresent(user -> {
                        data.put("email", user.getEmail());
                        data.put("fullName", user.getFullName());
                    });
                    
                    return data;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "totalResidents", totalResidents,
                "residentsWithEmail", residentsWithEmail,
                "sampleData", sampleData
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi kiểm tra dữ liệu cư dân: " + e.getMessage()
            ));
        }
    }

    // 12. Tạo dữ liệu cư dân mẫu cho một số căn hộ
    @PostMapping("/admin/create-sample-residents")
    public ResponseEntity<?> createSampleResidents(@RequestParam(defaultValue = "10") int count) {
        try {
            // Lấy role RESIDENT
            Role residentRole = roleRepository.findByName("RESIDENT");
            if (residentRole == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy role RESIDENT"
                ));
            }

            // Lấy một số căn hộ để tạo cư dân
            var apartments = apartmentRepository.findAll().stream()
                .limit(count)
                .collect(java.util.stream.Collectors.toList());

            int createdCount = 0;
            for (int i = 0; i < apartments.size(); i++) {
                var apartment = apartments.get(i);
                
                // Tạo user cư dân
                User resident = new User();
                resident.setUsername("resident_" + apartment.getId());
                resident.setEmail("resident" + apartment.getId() + "@apartment.com");
                resident.setPhoneNumber("090" + String.format("%07d", apartment.getId()));
                resident.setFullName("Cư dân căn hộ " + apartment.getUnitNumber());
                resident.setDateOfBirth(LocalDate.of(1980 + (i % 20), 1, 1));
                resident.setIdCardNumber("123456789" + String.format("%03d", apartment.getId()));
                resident.setStatus(UserStatus.ACTIVE);
                resident.setRoles(Set.of(residentRole));
                resident.setCreatedAt(java.time.LocalDateTime.now());
                resident.setUpdatedAt(java.time.LocalDateTime.now());
                
                userRepository.save(resident);
                
                // Tạo liên kết apartment-resident
                ApartmentResident apartmentResident = ApartmentResident.builder()
                    .id(new ApartmentResidentId(apartment.getId(), resident.getId()))
                    .apartment(apartment)
                    .user(resident)
                    .moveInDate(LocalDate.now().minusMonths(6))
                    .relationType(RelationType.OWNER)
                    .isPrimaryResident(true)
                    .build();
                
                apartmentResidentRepository.save(apartmentResident);
                createdCount++;
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã tạo " + createdCount + " cư dân mẫu",
                "createdCount", createdCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi tạo cư dân mẫu: " + e.getMessage()
            ));
        }
    }

    // 13. Gửi email tuần tự cho từng căn hộ
    @PostMapping("/admin/send-emails-sequential")
    public ResponseEntity<?> sendEmailsSequential(@RequestParam String period, 
                                                 @RequestParam(defaultValue = "10") int maxApartments) {
        try {
            // Lấy danh sách căn hộ có cư dân
            var apartmentsWithResidents = apartmentResidentRepository.findAll().stream()
                .map(ar -> ar.getId().getApartmentId())
                .distinct()
                .limit(maxApartments)
                .collect(java.util.stream.Collectors.toList());

            int successCount = 0;
            int failCount = 0;
            java.util.List<String> results = new java.util.ArrayList<>();

            for (Long apartmentId : apartmentsWithResidents) {
                try {
                    System.out.println("DEBUG: Gửi email tuần tự cho căn hộ " + apartmentId + " kỳ " + period);
                    invoiceService.sendInvoiceEmailsForApartmentPeriod(apartmentId, period);
                    successCount++;
                    results.add("Căn hộ " + apartmentId + ": Thành công");
                    System.out.println("DEBUG: Gửi email thành công cho căn hộ " + apartmentId);
                } catch (Exception e) {
                    failCount++;
                    results.add("Căn hộ " + apartmentId + ": Lỗi - " + e.getMessage());
                    System.out.println("ERROR: Lỗi gửi email cho căn hộ " + apartmentId + ": " + e.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hoàn thành gửi email tuần tự",
                "totalProcessed", apartmentsWithResidents.size(),
                "successCount", successCount,
                "failCount", failCount,
                "results", results
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi gửi email tuần tự: " + e.getMessage()
            ));
        }
    }
}
