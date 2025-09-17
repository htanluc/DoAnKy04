package com.mytech.apartment.portal.apis;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.services.WaterMeterService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@Validated
public class WaterMeterController {

    private final WaterMeterService waterMeterService;

    public WaterMeterController(WaterMeterService waterMeterService) {
        this.waterMeterService = waterMeterService;
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
}
