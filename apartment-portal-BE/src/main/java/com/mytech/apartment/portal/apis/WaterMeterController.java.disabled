package com.mytech.apartment.portal.apis;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.services.WaterMeterService;
import com.mytech.apartment.portal.services.ApartmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/water-readings")
@Validated
public class WaterMeterController {

    private final WaterMeterService waterMeterService;
    private final ApartmentService apartmentService;

    public WaterMeterController(WaterMeterService waterMeterService, 
                               ApartmentService apartmentService) {
        this.waterMeterService = waterMeterService;
        this.apartmentService = apartmentService;
    }

    // 1. Create or Update (upsert) via POST (tương tự addReading)
    @PostMapping
    public ResponseEntity<WaterMeterReadingDto> createOrUpdateReading(
            @Valid @RequestBody WaterMeterReadingDto dto
    ) {
        WaterMeterReadingDto saved = waterMeterService.addReading(dto);
        return ResponseEntity.ok(saved);
    }

    // 2. Read all readings
    @GetMapping
    public ResponseEntity<List<WaterMeterReadingDto>> listAll() {
        return ResponseEntity.ok(waterMeterService.getAllReadings());
    }

    // 2.1. Read readings by specific month
    @GetMapping("/by-month")
    public ResponseEntity<List<WaterMeterReadingDto>> getReadingsByMonth(
            @RequestParam("month") String month
    ) {
        return ResponseEntity.ok(waterMeterService.getReadingsByMonth(month));
    }

    // 3. Read one by ID
    @GetMapping("/{id}")
    public ResponseEntity<WaterMeterReadingDto> getById(@PathVariable Long id) {
        return waterMeterService.getReadingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Full replace via PUT
    @PutMapping("/{id}")
    public ResponseEntity<WaterMeterReadingDto> replaceReading(
            @PathVariable Long id,
            @Valid @RequestBody WaterMeterReadingDto dto
    ) {
        WaterMeterReadingDto updated = waterMeterService.updateReading(id, dto);
        return ResponseEntity.ok(updated);
    }

    // 5. Partial update via PATCH
    @PatchMapping("/{id}")
    public ResponseEntity<WaterMeterReadingDto> patchReading(@PathVariable("id") Long id,
            @RequestBody Map<String, Object> updates
    ) {
        WaterMeterReadingDto patched = waterMeterService.patchReading(id, updates);
        return ResponseEntity.ok(patched);
    }

    // 6. Delete by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReading(@PathVariable("id") Long id) {
        waterMeterService.deleteReading(id);
        return ResponseEntity.noContent().build();
    }

    // 7. Generate readings for a new month
    @PostMapping("/generate")
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

    // 8. Generate current month template (use service directly)
    @PostMapping("/generate-current-month")
    public ResponseEntity<Map<String, String>> generateCurrentMonthTemplate() {
        try {
            String currentMonth = java.time.YearMonth.now().toString();
            waterMeterService.generateHistory(currentMonth);
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã tạo template chỉ số nước cho tháng hiện tại " + currentMonth
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false", 
                "error", e.getMessage()
            ));
        }
    }

    // 9. Initialize water meter readings for all apartments
    @PostMapping("/init-all-apartments")
    public ResponseEntity<Map<String, String>> initAllApartments() {
        try {
            apartmentService.initializeWaterMeterForAllApartments();
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã khởi tạo chỉ số nước cho tất cả căn hộ"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false", 
                "error", e.getMessage()
            ));
                }
    }
}
