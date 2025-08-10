package com.mytech.apartment.portal.services;

// import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
// import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.mappers.InvoiceItemMapper;
import com.mytech.apartment.portal.mappers.InvoiceMapper;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
// import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.HashSet;
import java.util.Optional;
// import java.util.Set;
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
        YearMonth targetMonth = YearMonth.parse(period);

        // Lấy tất cả căn hộ để đảm bảo căn hộ mới cũng có hóa đơn
        List<Long> apartmentIds = apartmentRepository.findAll()
            .stream()
            .map(Apartment::getId)
            .collect(Collectors.toList());

        for (Long apartmentId : apartmentIds) {
            // Tránh tạo trùng hóa đơn cho cùng kỳ
            Optional<Invoice> existing = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, period);
            if (existing.isPresent()) {
                continue;
            }

            Invoice invoice = new Invoice();
            invoice.setApartmentId(apartmentId);
            invoice.setBillingPeriod(period);
            invoice.setIssueDate(targetMonth.atDay(1));
            invoice.setDueDate(targetMonth.atDay(15));
            invoice.setStatus(InvoiceStatus.UNPAID);
            invoice.setTotalAmount(0.0);

            invoiceRepository.save(invoice);
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
        Invoice invoice = invoiceRepository
            .findByApartmentIdAndBillingPeriod(apartmentId, period)
            .orElseThrow(() -> new RuntimeException(
                "Invoice not found for apt=" + apartmentId + ", period=" + period));

        // Đảm bảo tập items không null và kiểm tra idempotent
        if (invoice.getItems() == null) {
            invoice.setItems(new HashSet<>());
        } else if (invoice.getItems().stream().anyMatch(
                it -> feeType.equals(it.getFeeType()) && description.equals(it.getDescription()))) {
            return;
        }

        InvoiceItem item = new InvoiceItem();
        item.setFeeType(feeType);               // setter đúng field feeType
        item.setDescription(description);
        item.setAmount(amount.doubleValue());
        item.setInvoice(invoice);

        invoice.getItems().add(item);
        invoice.setTotalAmount(invoice.getTotalAmount() + amount.doubleValue());
        invoiceRepository.save(invoice);
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
            .findByUser_Id(userId)
            .stream()
            .map(link -> link.getApartmentId())
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
