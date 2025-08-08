package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.mappers.InvoiceItemMapper;
import com.mytech.apartment.portal.mappers.InvoiceMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private InvoiceMapper    invoiceMapper;
    @Autowired private InvoiceItemMapper invoiceItemMapper;
    @Autowired private ApartmentResidentRepository apartmentResidentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ApartmentRepository apartmentRepository;

    // ... (các method CRUD).

    /**
     * Sinh hóa đơn cơ bản cho tất cả căn hộ trong kỳ (chưa gồm phí phát sinh).
     */
    public void generateInvoicesForMonth(String period) {
        // Lấy tất cả căn hộ từ bảng apartments thay vì chỉ từ invoices
        List<Long> aptIds = apartmentRepository.findAll().stream()
            .map(apartment -> apartment.getId())
            .collect(Collectors.toList());
            
        System.out.println("DEBUG: Tìm thấy " + aptIds.size() + " căn hộ để tạo hóa đơn");
        
        for (Long aptId : aptIds) {
            // Kiểm tra xem hóa đơn đã tồn tại chưa
            Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(aptId, period);
            if (existingInvoice.isPresent()) {
                System.out.println("DEBUG: Hóa đơn đã tồn tại cho căn hộ " + aptId + " kỳ " + period);
                continue; // Bỏ qua nếu đã có hóa đơn
            }
            
            // Lấy thông tin căn hộ
            Optional<Apartment> apartment = apartmentRepository.findById(aptId);
            if (apartment.isEmpty()) {
                System.out.println("DEBUG: Không tìm thấy căn hộ " + aptId);
                continue;
            }
            
            // Tính toán phí dịch vụ cơ bản
            double serviceFee = apartment.get().getArea() * 5000.0; // 5000 VND/m2
            
            // Tạo hóa đơn với chi tiết
            Invoice invoice = Invoice.builder()
                .apartmentId(aptId)
                .billingPeriod(period)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(15))
                .status(InvoiceStatus.UNPAID)
                .totalAmount(serviceFee)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            // Khởi tạo danh sách items
            invoice.setItems(new HashSet<>());
            
            // Tạo chi tiết hóa đơn cho phí dịch vụ
            if (serviceFee > 0) {
                InvoiceItem serviceItem = InvoiceItem.builder()
                    .invoice(invoice)
                    .feeType("SERVICE_FEE")
                    .description("Phí dịch vụ chung (" + apartment.get().getArea() + "m²)")
                    .amount(serviceFee)
                    .build();
                invoice.getItems().add(serviceItem);
            }
            
            invoiceRepository.save(invoice);
            System.out.println("DEBUG: Tạo hóa đơn cho căn hộ " + aptId + " kỳ " + period + " với tổng tiền " + serviceFee + " và " + invoice.getItems().size() + " chi tiết");
        }
    }

    /**
     * Thêm một dòng phí vào hóa đơn đã tồn tại.
     */
    public void addInvoiceItem(Long apartmentId,
                               String period,
                               String feeType,
                               String description,
                               BigDecimal amount) {
        try {
            System.out.println("DEBUG: addInvoiceItem - Tìm hóa đơn cho căn hộ " + apartmentId + " kỳ " + period);
            
            Invoice invoice = invoiceRepository
                .findByApartmentIdAndBillingPeriod(apartmentId, period)
                .orElseThrow(() -> new RuntimeException(
                    "Invoice not found for apt=" + apartmentId + ", period=" + period));

            System.out.println("DEBUG: addInvoiceItem - Tìm thấy hóa đơn ID " + invoice.getId());

            InvoiceItem item = new InvoiceItem();
            item.setFeeType(feeType);
            item.setDescription(description);
            item.setAmount(amount.doubleValue());
            item.setInvoice(invoice);

            // Khởi tạo items list nếu null
            if (invoice.getItems() == null) {
                invoice.setItems(new HashSet<>());
            }

            invoice.getItems().add(item);
            invoice.setTotalAmount(invoice.getTotalAmount() + amount.doubleValue());
            
            System.out.println("DEBUG: addInvoiceItem - Thêm item: " + feeType + " - " + description + " - " + amount);
            System.out.println("DEBUG: addInvoiceItem - Tổng tiền mới: " + invoice.getTotalAmount());
            
            invoiceRepository.save(invoice);
            System.out.println("DEBUG: addInvoiceItem - Đã lưu hóa đơn thành công");
        } catch (Exception e) {
            System.err.println("DEBUG: addInvoiceItem - Lỗi: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    public void notifyResidents(String period) {
        // TODO: implement gửi email/SMS
    }

    public InvoiceDto generateInvoice(Invoice invoice) {
        return invoiceMapper.toDto(invoiceRepository.save(invoice));
    }

    public List<InvoiceDto> getInvoicesByApartmentIds(List<Long> apartmentIds) {
        return invoiceRepository.findByApartmentIdIn(apartmentIds).stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Get invoices by username (phone number)
     * [VI] Lấy hóa đơn theo username (số điện thoại)
     */
    public List<InvoiceDto> getInvoicesByUsername(String username) {
        // Tìm user theo username (phone number)
        var userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        
        Long userId = userOpt.get().getId();
        
        // Lấy danh sách căn hộ của user
        List<Long> apartmentIds = apartmentResidentRepository
            .findByIdUserId(userId)
            .stream()
            .map(link -> link.getId().getApartmentId())
            .collect(Collectors.toList());
        
        if (apartmentIds.isEmpty()) {
            return List.of();
        }
        
        // Lấy hóa đơn theo apartmentIds
        return getInvoicesByApartmentIds(apartmentIds);
    }

    /**
     * [EN] Get all invoices (admin only)
     * [VI] Lấy tất cả hóa đơn (chỉ admin)
     */
    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Get invoice by ID
     * [VI] Lấy hóa đơn theo ID
     */
    public Optional<InvoiceDto> getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .map(invoiceMapper::toDto);
    }

    /**
     * [EN] Get latest invoice by apartment ID
     * [VI] Lấy hóa đơn mới nhất theo ID căn hộ
     */
    public Optional<InvoiceDto> getLatestInvoiceByApartmentId(Long apartmentId) {
        return invoiceRepository.findTopByApartmentIdOrderByBillingPeriodDesc(apartmentId)
                .map(invoiceMapper::toDto);
    }

    /**
     * [EN] Get invoices by apartment ID
     * [VI] Lấy tất cả hóa đơn theo ID căn hộ
     */
    public List<InvoiceDto> getInvoicesByApartmentId(Long apartmentId) {
        return invoiceRepository.findByApartmentIdOrderByBillingPeriodDesc(apartmentId).stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }
}
