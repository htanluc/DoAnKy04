package com.mytech.apartment.portal.apis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class HealthCheckApi {
    
    @Autowired
    private com.mytech.apartment.portal.repositories.WaterMeterReadingRepository waterMeterReadingRepository;
    
    @Autowired
    private com.mytech.apartment.portal.repositories.InvoiceRepository invoiceRepository;

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @Autowired
    private com.mytech.apartment.portal.services.WaterMeterService waterMeterService;

    /**
     * DEBUG: Add water meter reading for apartment 56 August 2025
     */
    @PostMapping("/fix-water-56")
    public ResponseEntity<Map<String, Object>> fixWater56() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("=== FIXING WATER METER FOR APARTMENT 56 ===");
            
            // Create water meter reading DTO
            com.mytech.apartment.portal.dtos.WaterMeterReadingDto dto = new com.mytech.apartment.portal.dtos.WaterMeterReadingDto();
            dto.setApartmentId(56);
            dto.setReadingMonth("2025-08");
            dto.setPreviousReading(java.math.BigDecimal.ZERO);
            dto.setCurrentReading(new java.math.BigDecimal("22.00"));
            
            // Add the reading
            com.mytech.apartment.portal.dtos.WaterMeterReadingDto saved = waterMeterService.addReading(dto);
            
            System.out.println("✅ Successfully added water meter reading:");
            System.out.println("  - Apartment: " + saved.getApartmentId());
            System.out.println("  - Month: " + saved.getReadingMonth());
            System.out.println("  - Previous: " + saved.getPreviousReading());
            System.out.println("  - Current: " + saved.getCurrentReading());
            System.out.println("  - Consumption: " + saved.getConsumption());
            
            result.put("success", true);
            result.put("message", "Water meter reading added successfully");
            result.put("apartmentId", saved.getApartmentId());
            result.put("month", saved.getReadingMonth());
            result.put("consumption", saved.getConsumption());
            result.put("expectedFee", saved.getConsumption().multiply(new java.math.BigDecimal("15000")));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("🚨 ERROR adding water meter reading: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * DEBUG: Check water meter data for apartment 52
     */
    @GetMapping("/debug-water-52")
    public ResponseEntity<Map<String, Object>> debugWater52() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("=== DEBUG WATER METER DATA FOR APARTMENT 52 ===");
            
            // 1. Check different month formats
            String[] monthFormats = {"2025-08", "2025-8", "08/2025", "8/2025", "2025-Aug"};
            
            for (String month : monthFormats) {
                Optional<com.mytech.apartment.portal.models.WaterMeterReading> reading = 
                    waterMeterReadingRepository.findByApartmentIdAndReadingMonth(52, month);
                
                System.out.println("Month format '" + month + "': " + (reading.isPresent() ? "FOUND ✓" : "NOT FOUND ✗"));
                
                if (reading.isPresent()) {
                    com.mytech.apartment.portal.models.WaterMeterReading r = reading.get();
                    System.out.println("  - Previous: " + r.getPreviousReading());
                    System.out.println("  - Current: " + r.getCurrentReading());
                    System.out.println("  - Consumption: " + r.getConsumption());
                    
                    result.put("foundMonth", month);
                    result.put("previousReading", r.getPreviousReading());
                    result.put("currentReading", r.getCurrentReading());
                    result.put("consumption", r.getConsumption());
                }
            }
            
            // 2. Check all water meter data for apartment 52
            List<com.mytech.apartment.portal.models.WaterMeterReading> allReadings = 
                waterMeterReadingRepository.findAllByApartmentIdOrderByReadingMonthDesc(52);
            
            System.out.println("📊 All water meter readings for apartment 52 (" + allReadings.size() + " records):");
            for (com.mytech.apartment.portal.models.WaterMeterReading r : allReadings) {
                System.out.println("  * " + r.getReadingMonth() + " - Consumption: " + r.getConsumption() + 
                                   " (Prev: " + r.getPreviousReading() + ", Cur: " + r.getCurrentReading() + ")");
            }
            
            result.put("allReadingsCount", allReadings.size());
            List<Map<String, Object>> readingsDetail = new ArrayList<>();
            for (com.mytech.apartment.portal.models.WaterMeterReading r : allReadings) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("month", r.getReadingMonth());
                detail.put("consumption", r.getConsumption());
                detail.put("previous", r.getPreviousReading());
                detail.put("current", r.getCurrentReading());
                readingsDetail.add(detail);
            }
            result.put("allReadings", readingsDetail);
            
            // 3. Check invoice for apartment 52
            Optional<com.mytech.apartment.portal.models.Invoice> invoice = 
                invoiceRepository.findByApartmentIdAndBillingPeriod(52L, "2025-08");
            
            if (invoice.isPresent()) {
                com.mytech.apartment.portal.models.Invoice inv = invoice.get();
                System.out.println("💰 Invoice 2025-08 exists:");
                System.out.println("  - Total: " + inv.getTotalAmount());
                System.out.println("  - Items: " + inv.getItems().size());
                
                boolean hasWaterFee = inv.getItems().stream()
                    .anyMatch(item -> "WATER_FEE".equals(item.getFeeType()));
                System.out.println("  - Has water fee: " + hasWaterFee);
                
                inv.getItems().forEach(item -> {
                    System.out.println("    * " + item.getFeeType() + ": " + item.getAmount() + " (" + item.getDescription() + ")");
                });
                
                result.put("invoiceExists", true);
                result.put("invoiceTotal", inv.getTotalAmount());
                result.put("hasWaterFee", hasWaterFee);
                result.put("itemsCount", inv.getItems().size());
            } else {
                System.out.println("❌ No invoice found for 2025-08");
                result.put("invoiceExists", false);
            }
            
            System.out.println("=== END DEBUG FOR APARTMENT 52 ===");
            
            result.put("success", true);
            result.put("apartmentId", 52);
            result.put("checkTime", new Date().toString());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("🚨 DEBUG ERROR: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * DEBUG: Check water meter data for apartment 56
     */
    @GetMapping("/debug-water-56")
    public ResponseEntity<Map<String, Object>> debugWater56() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("=== DEBUG WATER METER DATA FOR APARTMENT 56 ===");
            
            // 1. Check different month formats
            String[] monthFormats = {"2025-08", "2025-8", "08/2025", "8/2025", "2025-Aug"};
            
            for (String month : monthFormats) {
                Optional<com.mytech.apartment.portal.models.WaterMeterReading> reading = 
                    waterMeterReadingRepository.findByApartmentIdAndReadingMonth(56, month);
                
                System.out.println("Month format '" + month + "': " + (reading.isPresent() ? "FOUND ✓" : "NOT FOUND ✗"));
                
                if (reading.isPresent()) {
                    com.mytech.apartment.portal.models.WaterMeterReading r = reading.get();
                    System.out.println("  - Previous: " + r.getPreviousReading());
                    System.out.println("  - Current: " + r.getCurrentReading());
                    System.out.println("  - Consumption: " + r.getConsumption());
                    
                    result.put("foundMonth", month);
                    result.put("previousReading", r.getPreviousReading());
                    result.put("currentReading", r.getCurrentReading());
                    result.put("consumption", r.getConsumption());
                }
            }
            
            // 2. Check all water meter data for apartment 56
            List<com.mytech.apartment.portal.models.WaterMeterReading> allReadings = 
                waterMeterReadingRepository.findAllByApartmentIdOrderByReadingMonthDesc(56);
            
            System.out.println("📊 All water meter readings for apartment 56 (" + allReadings.size() + " records):");
            for (com.mytech.apartment.portal.models.WaterMeterReading r : allReadings) {
                System.out.println("  * " + r.getReadingMonth() + " - Consumption: " + r.getConsumption() + 
                                   " (Prev: " + r.getPreviousReading() + ", Cur: " + r.getCurrentReading() + ")");
            }
            
            result.put("allReadingsCount", allReadings.size());
            List<Map<String, Object>> readingsDetail = new ArrayList<>();
            for (com.mytech.apartment.portal.models.WaterMeterReading r : allReadings) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("month", r.getReadingMonth());
                detail.put("consumption", r.getConsumption());
                detail.put("previous", r.getPreviousReading());
                detail.put("current", r.getCurrentReading());
                readingsDetail.add(detail);
            }
            result.put("allReadings", readingsDetail);
            
            // 3. Check invoice for apartment 56
            Optional<com.mytech.apartment.portal.models.Invoice> invoice = 
                invoiceRepository.findByApartmentIdAndBillingPeriod(56L, "2025-08");
            
            if (invoice.isPresent()) {
                com.mytech.apartment.portal.models.Invoice inv = invoice.get();
                System.out.println("💰 Invoice 2025-08 exists:");
                System.out.println("  - Total: " + inv.getTotalAmount());
                System.out.println("  - Items: " + inv.getItems().size());
                
                boolean hasWaterFee = inv.getItems().stream()
                    .anyMatch(item -> "WATER_FEE".equals(item.getFeeType()));
                System.out.println("  - Has water fee: " + hasWaterFee);
                
                inv.getItems().forEach(item -> {
                    System.out.println("    * " + item.getFeeType() + ": " + item.getAmount() + " (" + item.getDescription() + ")");
                });
                
                result.put("invoiceExists", true);
                result.put("invoiceTotal", inv.getTotalAmount());
                result.put("hasWaterFee", hasWaterFee);
                result.put("itemsCount", inv.getItems().size());
            } else {
                System.out.println("❌ No invoice found for 2025-08");
                result.put("invoiceExists", false);
            }
            
            System.out.println("=== END DEBUG ===");
            
            result.put("success", true);
            result.put("apartmentId", 56);
            result.put("checkTime", new Date().toString());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("🚨 DEBUG ERROR: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
}
