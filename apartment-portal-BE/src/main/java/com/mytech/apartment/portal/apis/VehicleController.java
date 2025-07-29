package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.VehicleCreateRequest;
import com.mytech.apartment.portal.dtos.VehicleDto;
import com.mytech.apartment.portal.models.enums.VehicleStatus;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.services.VehicleService;
import com.mytech.apartment.portal.services.FileUploadService;
// import com.mytech.apartment.portal.services.CloudinaryService;  // Uncomment when using Cloudinary
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final FileUploadService fileUploadService;
    // private final CloudinaryService cloudinaryService;  // Uncomment when using Cloudinary

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleDto> createVehicle(
            @Valid @RequestBody VehicleCreateRequest request,
            Authentication authentication) {
        VehicleDto vehicle = vehicleService.createVehicle(request, authentication);
        return ResponseEntity.ok(vehicle);
    }

    @PostMapping("/vehicles/upload-image")
    public ResponseEntity<String> uploadVehicleImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileUploadService.uploadVehicleImage(file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi upload file: " + e.getMessage());
        }
    }

    @PostMapping("/vehicles/upload-images")
    public ResponseEntity<String[]> uploadVehicleImages(@RequestParam("files") MultipartFile[] files) {
        try {
            // Sử dụng local storage cho development
            String[] imageUrls = fileUploadService.uploadMultipleVehicleImages(files);
            return ResponseEntity.ok(imageUrls);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new String[0]);
        }
    }

    // Test endpoint không cần authentication
    @PostMapping("/test/upload-images")
    public ResponseEntity<String[]> testUploadImages(@RequestParam("files") MultipartFile[] files) {
        try {
            String[] imageUrls = fileUploadService.uploadMultipleVehicleImages(files);
            return ResponseEntity.ok(imageUrls);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new String[0]);
        }
    }

    // Cloudinary endpoint - Uncomment when ready to use Cloudinary
    /*
    @PostMapping("/vehicles/upload-images-cloudinary")
    public ResponseEntity<String[]> uploadVehicleImagesCloudinary(@RequestParam("files") MultipartFile[] files) {
        try {
            String[] imageUrls = cloudinaryService.uploadMultipleImages(files);
            return ResponseEntity.ok(imageUrls);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new String[0]);
        }
    }
    */

    @GetMapping("/vehicles/my")
    public ResponseEntity<List<VehicleDto>> getMyVehicles(Authentication authentication) {
        List<VehicleDto> vehicles = vehicleService.getVehiclesByCurrentUser(authentication);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/vehicles/types")
    public ResponseEntity<List<Map<String, Object>>> getVehicleTypes() {
        List<VehicleType> types = vehicleService.getVehicleTypes();
        List<Map<String, Object>> result = types.stream()
                .map(type -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("value", type.name());
                    map.put("displayName", type.getDisplayName());
                    map.put("monthlyFee", type.getMonthlyFee());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    // Admin endpoints
    @GetMapping("/admin/vehicles")
    public ResponseEntity<List<VehicleDto>> getAllVehicles() {
        List<VehicleDto> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/admin/vehicles/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Long id) {
        VehicleDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/admin/vehicles/{id}/status")
    public ResponseEntity<VehicleDto> updateVehicleStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        VehicleStatus status = VehicleStatus.valueOf(request.get("status"));
        VehicleDto vehicle = vehicleService.updateVehicleStatus(id, status);
        return ResponseEntity.ok(vehicle);
    }

    @GetMapping("/admin/vehicles/status/{status}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByStatus(@PathVariable String status) {
        VehicleStatus vehicleStatus = VehicleStatus.valueOf(status.toUpperCase());
        List<VehicleDto> vehicles = vehicleService.getVehiclesByStatus(vehicleStatus);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/admin/vehicles/pending")
    public ResponseEntity<List<VehicleDto>> getPendingVehicles() {
        List<VehicleDto> vehicles = vehicleService.getPendingVehicles();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/admin/vehicles/approved")
    public ResponseEntity<List<VehicleDto>> getApprovedVehicles() {
        List<VehicleDto> vehicles = vehicleService.getApprovedVehicles();
        return ResponseEntity.ok(vehicles);
    }

    @DeleteMapping("/admin/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
} 