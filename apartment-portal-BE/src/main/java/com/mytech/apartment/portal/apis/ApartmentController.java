package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.services.ApartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
@Tag(name = "Resident Apartment", description = "API for resident to view their own apartments")
public class ApartmentController {
    @Autowired
    private ApartmentService apartmentService;

    /**
     * Get all apartments
     * Lấy danh sách tất cả căn hộ
     */
    @GetMapping
    public List<ApartmentDto> getAllApartments() {
        try {
            List<ApartmentDto> apartments = apartmentService.getAllApartments();
            if (apartments == null || apartments.isEmpty()) {
                System.out.println("[WARN] Danh sách apartment trả về rỗng!");
            } else {
                System.out.println("[INFO] Số lượng apartment trả về: " + apartments.size());
            }
            return apartments;
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách apartment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Get all apartments (Admin only)
     * Lấy danh sách tất cả căn hộ (Chỉ admin)
     */
    @GetMapping("/admin")
    public List<ApartmentDto> getAllApartmentsForAdmin() {
        try {
            List<ApartmentDto> apartments = apartmentService.getAllApartments();
            if (apartments == null || apartments.isEmpty()) {
                System.out.println("[WARN] Danh sách apartment trả về rỗng cho admin!");
            } else {
                System.out.println("[INFO] Số lượng apartment trả về cho admin: " + apartments.size());
            }
            return apartments;
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách apartment cho admin: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Get apartment by ID (Admin only)
     * Lấy thông tin căn hộ theo ID (Chỉ admin)
     */
    @GetMapping("/admin/{id}")
    public ResponseEntity<ApartmentDto> getApartmentByIdForAdmin(@PathVariable("id") Long id) {
        return apartmentService.getApartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get apartment by ID
     * Lấy thông tin căn hộ theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApartmentDto> getApartmentById(@PathVariable("id") Long id) {
        return apartmentService.getApartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update apartment by ID
     * Cập nhật thông tin căn hộ theo ID
     * Lưu ý: Không thể thêm/xóa căn hộ sau khi triển khai
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApartmentDto> updateApartment(@PathVariable("id") Long id, @RequestBody ApartmentUpdateRequest request) {
        try {
            ApartmentDto updatedApartment = apartmentService.updateApartment(id, request);
            return ResponseEntity.ok(updatedApartment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Link user to apartment
     * Liên kết tài khoản user với căn hộ
     */
    @PostMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResponse<String>> linkResidentToApartment(
            @PathVariable("apartmentId") Long apartmentId,
            @Valid @RequestBody ApartmentResidentLinkRequest request) {
        try {
            System.out.println("📝 Controller: Bắt đầu liên kết cư dân với căn hộ " + apartmentId);
            System.out.println("📝 Controller: Request data: " + request);
            
            apartmentService.linkResidentToApartment(apartmentId, request);
            
            System.out.println("✅ Controller: Liên kết cư dân thành công!");
            return ResponseEntity.ok(ApiResponse.success("Liên kết user với căn hộ thành công!"));
            
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("❌ Controller: Lỗi khi liên kết cư dân: " + e.getMessage());
            e.printStackTrace();
            
            // Trả về thông báo lỗi rõ ràng
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                errorMessage = "Lỗi không xác định khi liên kết cư dân";
            }
            
            System.err.println("❌ Controller: Trả về error message: " + errorMessage);
            return ResponseEntity.badRequest().body(ApiResponse.error(errorMessage));
        }
    }
    /**
     * Test endpoint to check if API is working
     * Endpoint test để kiểm tra API có hoạt động không
     */
    @GetMapping("/admin/test")
    public ResponseEntity<ApiResponse<String>> testEndpoint() {
        return ResponseEntity.ok(ApiResponse.success("Apartment API is working", "Test successful"));
    }

    /**
     * Test endpoint to check database connection
     * Endpoint test để kiểm tra kết nối database
     */
    @GetMapping("/admin/test-db")
    public ResponseEntity<ApiResponse<String>> testDatabaseEndpoint() {
        try {
            // Kiểm tra kết nối database bằng cách đếm số apartment
            long apartmentCount = apartmentService.getAllApartments().size();
            return ResponseEntity.ok(ApiResponse.success("Database connection OK", "Found " + apartmentCount + " apartments"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Database connection failed: " + e.getMessage()));
        }
    }

    /**
     * Test endpoint to create a simple apartment-resident relationship
     * Endpoint test để tạo mối quan hệ apartment-resident đơn giản
     */
    @PostMapping("/admin/test-create-relationship")
    public ResponseEntity<ApiResponse<String>> testCreateRelationship() {
        try {
            System.out.println("🧪 Test: Bắt đầu tạo test relationship");
            
            // Test với apartment ID = 1 và user ID = 1
            ApartmentResidentLinkRequest testRequest = new ApartmentResidentLinkRequest();
            testRequest.setUserId(1L);
            testRequest.setRelationType("OWNER");
            testRequest.setMoveInDate(java.time.LocalDate.now());
            
            System.out.println("🧪 Test: Test request: " + testRequest);
            
            apartmentService.linkResidentToApartment(1L, testRequest);
            
            System.out.println("🧪 Test: Tạo relationship thành công!");
            return ResponseEntity.ok(ApiResponse.success("Test relationship created successfully", "Created relationship between apartment 1 and user 1"));
        } catch (Exception e) {
            System.err.println("🧪 Test: Lỗi khi tạo test relationship: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    /**
     * Test endpoint to check if user and apartment exist
     * Endpoint test để kiểm tra user và apartment có tồn tại không
     */
    @GetMapping("/admin/test-check-entities")
    public ResponseEntity<ApiResponse<String>> testCheckEntities() {
        try {
            System.out.println("🔍 Test: Kiểm tra entities");
            
            // Kiểm tra apartment ID = 1
            var apartmentOpt = apartmentService.getApartmentById(1L);
            if (apartmentOpt.isPresent()) {
                System.out.println("🔍 Test: Apartment 1 tồn tại: " + apartmentOpt.get().getUnitNumber());
            } else {
                System.out.println("🔍 Test: Apartment 1 KHÔNG tồn tại");
            }
            
            // Kiểm tra user ID = 1 (cần implement method này)
            System.out.println("🔍 Test: Kiểm tra user 1");
            
            return ResponseEntity.ok(ApiResponse.success("Entities check completed", "Check completed"));
        } catch (Exception e) {
            System.err.println("🔍 Test: Lỗi khi kiểm tra entities: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Entities check failed: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/apartment-residents/user/{userId}")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentLinksOfUser(@PathVariable("userId") Long userId) {
        List<ApartmentResidentDto> links = apartmentService.getApartmentLinksOfUser(userId);
        return ResponseEntity.ok(links);
    }
    /**
     * Unlink user from apartment
     * Hủy liên kết tài khoản user với căn hộ
     */
    @DeleteMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResponse<String>> unlinkResidentFromApartment(
            @PathVariable("apartmentId") Long apartmentId,
            @Valid @RequestBody ApartmentResidentUnlinkRequest request) {
        try {
            apartmentService.unlinkResidentFromApartment(apartmentId, request.getUserId());
            return ResponseEntity.ok(ApiResponse.success("Hủy liên kết user với căn hộ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get residents of apartment
     * Lấy danh sách cư dân của căn hộ
     */
    @GetMapping("/{apartmentId}/residents")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentResidents(@PathVariable("apartmentId") Long apartmentId) {
        try {
            List<ApartmentResidentDto> residents = apartmentService.getApartmentResidents(apartmentId);
            return ResponseEntity.ok(residents);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get apartments by building
     * Lấy danh sách căn hộ theo tòa nhà
     */
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<List<ApartmentDto>> getApartmentsByBuilding(@PathVariable("buildingId") Long buildingId) {
        try {
            List<ApartmentDto> apartments = apartmentService.getApartmentsByBuilding(buildingId);
            return ResponseEntity.ok(apartments);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get apartments by status
     * Lấy danh sách căn hộ theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ApartmentDto>> getApartmentsByStatus(@PathVariable("status") String status) {
        try {
            List<ApartmentDto> apartments = apartmentService.getApartmentsByStatus(status);
            return ResponseEntity.ok(apartments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * [EN] Get apartments of current resident
     * [VI] Lấy danh sách căn hộ của resident hiện tại
     */
    @Operation(summary = "Get apartments of current resident", description = "Get list of apartments linked to the currently authenticated resident")
    @GetMapping("/my")
    public ResponseEntity<List<ApartmentDto>> getMyApartments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        // Lấy userId từ username (có thể là phone/email/username)
        Long userId = null;
        try {
            // Thử tìm bằng username trước
            userId = apartmentService.getUserIdByUsername(username);
            // Nếu không tìm thấy, thử tìm bằng phoneNumber
            if (userId == null) {
                userId = apartmentService.getUserIdByPhoneNumber(username);
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        if (userId == null) return ResponseEntity.status(401).build();
        List<ApartmentDto> apartments = apartmentService.getApartmentsOfResident(userId);
        return ResponseEntity.ok(apartments);
    }

    /**
     * [EN] Get detailed info of current resident's apartment
     * [VI] Lấy thông tin chi tiết căn hộ của resident hiện tại
     */
    @Operation(summary = "Get my apartment info", description = "Get detailed info of the apartment linked to the currently authenticated resident")
    @GetMapping("/my/info")
    public ResponseEntity<?> getMyApartmentInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Long userId = null;
        try {
            // Thử tìm bằng username trước
            userId = apartmentService.getUserIdByUsername(username);
            // Nếu không tìm thấy, thử tìm bằng phoneNumber
            if (userId == null) {
                userId = apartmentService.getUserIdByPhoneNumber(username);
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Không xác định được user hiện tại");
        }
        if (userId == null) return ResponseEntity.status(401).body("Không xác định được user hiện tại");
        List<ApartmentDto> apartments = apartmentService.getApartmentsOfResident(userId);
        if (apartments == null || apartments.isEmpty()) {
            return ResponseEntity.badRequest().body("Bạn chưa được liên kết với căn hộ nào. Vui lòng liên hệ admin để được gán căn hộ.");
        }
        // Lấy căn hộ đầu tiên (nếu có nhiều)
        ApartmentDto apt = apartments.get(0);
        return ResponseEntity.ok(apt);
    }
}