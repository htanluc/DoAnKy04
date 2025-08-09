package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/apartments")
@Tag(name = "Admin Apartment", description = "API for admin to manage apartments")
public class AdminApartmentController {
    
    @Autowired
    private ApartmentService apartmentService;
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private WaterMeterService waterMeterService;
    
    @Autowired
    private ApartmentResidentService apartmentResidentService;

    /**
     * Get all apartments (admin only)
     * Lấy danh sách tất cả căn hộ (chỉ admin)
     */
    @GetMapping
    @Operation(summary = "Get all apartments", description = "Admin lấy danh sách tất cả căn hộ")
    public ResponseEntity<List<ApartmentDto>> getAllApartments() {
        try {
            List<ApartmentDto> apartments = apartmentService.getAllApartments();
            return ResponseEntity.ok(apartments);
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách apartment (admin): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get apartment by ID (admin only)
     * Lấy thông tin căn hộ theo ID (chỉ admin)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get apartment by ID", description = "Admin lấy thông tin căn hộ theo ID")
    public ResponseEntity<ApartmentDto> getApartmentById(@PathVariable Long id) {
        try {
            Optional<ApartmentDto> apartment = apartmentService.getApartmentById(id);
            return apartment.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy apartment theo ID (admin): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get latest invoice for apartment (admin only)
     * Lấy hóa đơn mới nhất của căn hộ (chỉ admin)
     */
    @GetMapping("/{id}/latest-invoice")
    @Operation(summary = "Get latest invoice for apartment", description = "Admin lấy hóa đơn mới nhất của căn hộ")
    public ResponseEntity<InvoiceDto> getLatestInvoice(@PathVariable Long id) {
        try {
            Optional<InvoiceDto> latestInvoice = invoiceService.getLatestInvoiceByApartmentId(id);
            return latestInvoice.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy hóa đơn mới nhất cho apartment " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get vehicles for apartment (admin only)
     * Lấy danh sách xe của căn hộ (chỉ admin)
     */
    @GetMapping("/{id}/vehicles")
    @Operation(summary = "Get vehicles for apartment", description = "Admin lấy danh sách xe của căn hộ")
    public ResponseEntity<List<VehicleDto>> getApartmentVehicles(@PathVariable Long id) {
        try {
            List<VehicleDto> vehicles = vehicleService.getVehiclesByApartment(id);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách xe cho apartment " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get water readings for apartment (admin only)
     * Lấy danh sách chỉ số nước của căn hộ (chỉ admin)
     */
    @GetMapping("/{id}/water-readings")
    @Operation(summary = "Get water readings for apartment", description = "Admin lấy danh sách chỉ số nước của căn hộ")
    public ResponseEntity<List<WaterMeterReadingDto>> getApartmentWaterReadings(@PathVariable Long id) {
        try {
            List<WaterMeterReadingDto> waterReadings = apartmentService.getWaterMetersByApartmentId(id);
            return ResponseEntity.ok(waterReadings);
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy chỉ số nước cho apartment " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get residents for apartment (admin only)
     * Lấy danh sách cư dân của căn hộ (chỉ admin)
     */
    @GetMapping("/{id}/residents")
    @Operation(summary = "Get residents for apartment", description = "Admin lấy danh sách cư dân của căn hộ")
    public ResponseEntity<List<ApartmentResidentDto>> getApartmentResidents(@PathVariable Long id) {
        try {
            List<ApartmentResidentDto> residents = apartmentResidentService.getResidentsByApartment(id);
            return ResponseEntity.ok(residents);
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách cư dân cho apartment " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get all invoices for apartment (admin only)
     * Lấy tất cả hóa đơn của căn hộ (chỉ admin)
     */
    @GetMapping("/{id}/invoices")
    @Operation(summary = "Get all invoices for apartment", description = "Admin lấy tất cả hóa đơn của căn hộ")
    public ResponseEntity<List<InvoiceDto>> getApartmentInvoices(@PathVariable Long id) {
        try {
            List<InvoiceDto> invoices = invoiceService.getInvoicesByApartmentId(id);
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            System.out.println("[ERROR] Lỗi khi lấy danh sách hóa đơn cho apartment " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
