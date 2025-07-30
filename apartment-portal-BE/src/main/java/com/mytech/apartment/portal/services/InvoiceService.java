package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.mappers.InvoiceItemMapper;
import com.mytech.apartment.portal.mappers.InvoiceMapper;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    // ... (các method CRUD).

    /**
     * Sinh hóa đơn cơ bản cho tất cả căn hộ trong kỳ (chưa gồm phí phát sinh).
     */
    public void generateInvoicesForMonth(String period) {
        List<Long> aptIds = invoiceRepository.findDistinctApartmentIds();
        for (Long aptId : aptIds) {
            Invoice inv = new Invoice();
            inv.setApartmentId(aptId);
            inv.setBillingPeriod(period);
            inv.setIssueDate(LocalDate.now());
            inv.setDueDate(LocalDate.now().plusDays(15));
            inv.setStatus(InvoiceStatus.UNPAID);
            inv.setTotalAmount(0.0);
            invoiceRepository.save(inv);
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
            .findByIdResidentId(userId) // Sửa từ findByIdUserId thành findByIdResidentId
            .stream()
            .map(link -> link.getId().getApartmentId())
            .collect(Collectors.toList());
        
        if (apartmentIds.isEmpty()) {
            return List.of();
        }
        
        // Lấy hóa đơn theo apartmentIds
        return getInvoicesByApartmentIds(apartmentIds);
    }
}
