package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.services.ServiceRequestService;
import com.mytech.apartment.portal.services.UserService;
import com.mytech.apartment.portal.services.FileUploadService;
import com.mytech.apartment.portal.services.ActivityLogService;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "Resident Support Request", description = "API for resident to view their own support requests")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private ActivityLogService activityLogService;

    /** Lấy danh sách tất cả yêu cầu hỗ trợ (admin) */
    @GetMapping("/admin/support-requests")
    public List<ServiceRequestDto> getAllServiceRequests() {
        return serviceRequestService.getAllServiceRequests();
    }

    /** Lấy yêu cầu hỗ trợ theo ID (admin) */
    @GetMapping("/admin/support-requests/{id}")
    public ResponseEntity<ServiceRequestDto> getServiceRequestById(
            @PathVariable("id") Long id
    ) {
        Optional<ServiceRequestDto> dto = serviceRequestService.getServiceRequestById(id);
        return dto
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Test endpoint để kiểm tra authentication */
    @GetMapping("/support-requests/test-auth")
    public ResponseEntity<Map<String, Object>> testAuth() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Map<String, Object> response = new HashMap<>();
            
            if (auth == null) {
                response.put("authenticated", false);
                response.put("message", "No authentication found");
                return ResponseEntity.status(401).body(response);
            }
            
            if (!auth.isAuthenticated()) {
                response.put("authenticated", false);
                response.put("message", "Not authenticated");
                return ResponseEntity.status(401).body(response);
            }
            
            String username = auth.getName();
            response.put("authenticated", true);
            response.put("username", username);
            response.put("authorities", auth.getAuthorities().stream()
                    .map(Object::toString)
                    .collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /** Tạo mới yêu cầu hỗ trợ */
    @PostMapping("/support-requests")
    public ResponseEntity<ServiceRequestDto> createServiceRequest(
            @Valid @RequestBody ServiceRequestCreateRequest request
    ) {
        try {
            System.out.println("ServiceRequestController: createServiceRequest called");
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("ServiceRequestController: Authentication failed - no auth or not authenticated");
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            System.out.println("ServiceRequestController: Authenticated username: " + username);
            
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                System.out.println("ServiceRequestController: User not found for phone number: " + username);
                return ResponseEntity.status(401).build();
            }
            
            System.out.println("ServiceRequestController: Found user ID: " + userId);
            
            // Set userId from authenticated user
            request.setUserId(userId); // Changed from setResidentId to setUserId
            System.out.println("ServiceRequestController: Final request: " + request);
            
            ServiceRequestDto dto = serviceRequestService.createServiceRequest(request);
            System.out.println("ServiceRequestController: Service request created successfully with ID: " + dto.getId());
            
            // Log service request creation
            activityLogService.logActivityForCurrentUser(ActivityActionType.CREATE_SERVICE_REQUEST, 
                "Tạo yêu cầu dịch vụ: %s", request.getTitle());
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("ServiceRequestController: Error in createServiceRequest: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /** Upload file cho service request */
    @PostMapping("/upload/service-request")
    public ResponseEntity<ApiResponse<String>> uploadServiceRequestFile(@RequestParam("file") MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String imageUrl = fileUploadService.uploadServiceRequestImage(file);
            return ResponseEntity.ok(ApiResponse.success("Upload file thành công", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi upload file: " + e.getMessage()));
        }
    }

    /** Cập nhật yêu cầu hỗ trợ theo ID (admin) */
    @PutMapping("/admin/support-requests/{id}")
    public ResponseEntity<ServiceRequestDto> updateServiceRequest(
            @PathVariable("id") Long id,
            @Valid @RequestBody ServiceRequestUpdateRequest request
    ) {
        try {
            ServiceRequestDto dto = serviceRequestService.updateServiceRequest(id, request);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Xóa yêu cầu hỗ trợ theo ID (admin) */
    @DeleteMapping("/admin/support-requests/{id}")
    public ResponseEntity<Void> deleteServiceRequest(
            @PathVariable("id") Long id
    ) {
        try {
            serviceRequestService.deleteServiceRequest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Phân loại và gán yêu cầu hỗ trợ cho nhân viên (admin) */
    @PostMapping("/admin/support-requests/{id}/assign")
    public ResponseEntity<ApiResponse<String>> assignServiceRequest(
            @PathVariable("id") Long id,
            @Valid @RequestBody ServiceRequestAssignmentRequest request
    ) {
        try {
            serviceRequestService.assignServiceRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("Gán yêu cầu hỗ trợ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Lấy yêu cầu hỗ trợ theo vai trò nhân viên */
    @GetMapping("/staff/support-requests")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByRole(
            @RequestParam("role") String role
    ) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByRole(role));
    }

    /** Lấy yêu cầu hỗ trợ được gán cho nhân viên cụ thể */
    @GetMapping("/staff/support-requests/assigned")
    public ResponseEntity<List<ServiceRequestDto>> getAssignedServiceRequests(
            @RequestParam("staffId") Long staffId
    ) {
        return ResponseEntity.ok(serviceRequestService.getAssignedServiceRequests(staffId));
    }

    /** Cập nhật trạng thái yêu cầu hỗ trợ (cho nhân viên) */
    @PutMapping("/staff/support-requests/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateServiceRequestStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody ServiceRequestStatusUpdateRequest request
    ) {
        try {
            serviceRequestService.updateServiceRequestStatus(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Lấy yêu cầu hỗ trợ theo trạng thái (admin) */
    @GetMapping("/admin/support-requests/status/{status}")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByStatus(
            @PathVariable("status") String status
    ) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByStatus(status));
    }

    /** Lấy yêu cầu hỗ trợ theo loại dịch vụ (admin) */
    @GetMapping("/admin/support-requests/category/{category}")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByCategory(
            @PathVariable("category") String category
    ) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByCategory(category));
    }

    /** [EN] Get support requests of current resident */
    @Operation(summary = "Get support requests of current resident",
               description = "Get list of support requests for the currently authenticated resident")
    @GetMapping("/support-requests/my")
    public ResponseEntity<List<ServiceRequestDto>> getMySupportRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phone = auth.getName();
        Long userId = userService.getUserIdByPhoneNumber(phone);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByUserId(userId));
    }
}
