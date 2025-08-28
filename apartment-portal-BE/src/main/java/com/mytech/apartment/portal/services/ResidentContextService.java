package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.AnnouncementDto;
import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.dtos.FacilityBookingDto;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.ServiceRequestDto;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ResidentContextService {

    @Autowired private UserRepository userRepository;
    @Autowired private InvoiceService invoiceService;
    @Autowired private FacilityBookingService facilityBookingService;
    @Autowired private AnnouncementService announcementService;
    @Autowired private VehicleService vehicleService;
    @Autowired private ServiceRequestService serviceRequestService;
    @Autowired private UserService userService;
    @Autowired private ApartmentResidentService apartmentResidentService;
    @Autowired private EventService eventService;

    /**
     * Build short personalized context for a resident identified by username (phoneNumber).
     * Context is concise to keep OpenAI prompt short.
     */
    public String buildContextForUsername(String username) {
        StringBuilder ctx = new StringBuilder();

        // Get user profile info first
        var userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isPresent()) {
            Long userId = userOpt.get().getId();
            UserDto userProfile = userService.getUserById(userId);
            if (userProfile != null) {
                ctx.append("👤 HO SO: ");
                ctx.append("📝 Ten: " + (userProfile.getFullName() != null ? userProfile.getFullName() : "Chua co ten"));
                ctx.append(" | ");
                ctx.append("📱 SDT: " + (userProfile.getPhoneNumber() != null ? userProfile.getPhoneNumber() : "Chua co SDT"));
                ctx.append(" | ");
                ctx.append("📧 Email: " + (userProfile.getEmail() != null ? userProfile.getEmail() : "Chua co email"));
                ctx.append(". ");
            }

            // Get apartment info
            List<ApartmentResidentDto> myApartments = apartmentResidentService.getApartmentsByUser(userId);
            if (!myApartments.isEmpty()) {
                ApartmentResidentDto primary = myApartments.stream()
                    .filter(apt -> Boolean.TRUE.equals(apt.getIsPrimaryResident()))
                    .findFirst()
                    .orElse(myApartments.get(0));
                
                ctx.append("\n🏠 CAN HO: ");
                ctx.append("🏢 So: " + (primary.getApartmentUnitNumber() != null ? primary.getApartmentUnitNumber() : "Chua co so"));
                ctx.append(" | ");
                ctx.append("👥 Quan he: " + (primary.getRelationTypeDisplayName() != null ? primary.getRelationTypeDisplayName() : "Chua co quan he"));
                ctx.append(". ");
            }
        }

        // Invoices overview - TẤT CẢ hóa đơn
        List<InvoiceDto> invoices = invoiceService.getInvoicesByUsername(username);
        long totalInvoices = invoices.size();
        long unpaidCount = invoices.stream()
            .filter(iv -> {
                String status = String.valueOf(iv.getStatus());
                return InvoiceStatus.UNPAID.name().equalsIgnoreCase(status)
                        || "UNPAID".equalsIgnoreCase(status)
                        || InvoiceStatus.OVERDUE.name().equalsIgnoreCase(status)
                        || "OVERDUE".equalsIgnoreCase(status);
            })
            .count();
        double totalUnpaidAmount = invoices.stream()
            .filter(iv -> {
                String status = String.valueOf(iv.getStatus());
                return InvoiceStatus.UNPAID.name().equalsIgnoreCase(status)
                        || "UNPAID".equalsIgnoreCase(status)
                        || InvoiceStatus.OVERDUE.name().equalsIgnoreCase(status)
                        || "OVERDUE".equalsIgnoreCase(status);
            })
            .mapToDouble(iv -> Optional.ofNullable(iv.getTotalAmount()).orElse(0.0))
            .sum();

        if (totalInvoices > 0) {
            ctx.append("\n" + "=".repeat(50));
            ctx.append("\n💰 HOA DON: ");
            ctx.append("📊 Tong so: " + totalInvoices + " | ");
            ctx.append("❌ Chua thanh toan: " + unpaidCount + " | ");
            ctx.append("💸 Tong no: " + String.format("%,.0f", totalUnpaidAmount) + " VND");
            ctx.append(". ");
            
            // Hiển thị hóa đơn theo thứ tự kỳ gần nhất với thông tin dễ hiểu
            ctx.append("\n📋 CHI TIET HOA DON: ");
            List<InvoiceDto> sortedInvoices = invoices.stream()
                .sorted(Comparator.comparing(InvoiceDto::getBillingPeriod, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
            
            for (int i = 0; i < sortedInvoices.size(); i++) {
                InvoiceDto iv = sortedInvoices.get(i);
                String status = String.valueOf(iv.getStatus());
                String statusEmoji = "UNPAID".equalsIgnoreCase(status) ? "🔴" :
                                   "OVERDUE".equalsIgnoreCase(status) ? "⛔" :
                                   "PAID".equalsIgnoreCase(status) ? "✅" : "❓";
                String statusText = "UNPAID".equalsIgnoreCase(status) ? "Chua thanh toan" :
                                  "OVERDUE".equalsIgnoreCase(status) ? "Qua han" :
                                  "PAID".equalsIgnoreCase(status) ? "Da thanh toan" : status;
                
                ctx.append(String.format("\n%d. %s Thang %s: %s VND (%s)", 
                    i + 1,
                    statusEmoji,
                    String.valueOf(iv.getBillingPeriod()),
                    String.format("%,.0f", Optional.ofNullable(iv.getTotalAmount()).orElse(0.0)),
                    statusText));
            }
            ctx.append(". ");
        }

        // Upcoming facility booking - TẤT CẢ lịch đặt
        var userOpt2 = userRepository.findByPhoneNumber(username);
        if (userOpt2.isPresent()) {
            Long userId = userOpt2.get().getId();
            List<FacilityBookingDto> myBookings = facilityBookingService.getFacilityBookingsByUserId(userId);
            LocalDateTime now = LocalDateTime.now();
            List<FacilityBookingDto> upcoming = myBookings.stream()
                .filter(b -> b.getStartTime() != null && b.getStartTime().isAfter(now))
                .sorted(Comparator.comparing(FacilityBookingDto::getStartTime))
                .collect(Collectors.toList());

            if (!upcoming.isEmpty()) {
                ctx.append("\n" + "-".repeat(40));
                ctx.append("\n🏢 DAT TIEN ICH SAP TOI: ");
                ctx.append("📊 Tong so: " + upcoming.size() + ". ");
                
                // Hiển thị lịch đặt sắp tới với thông tin dễ hiểu
                ctx.append("\n📋 DANH SACH LICH DAT: ");
                for (int i = 0; i < upcoming.size(); i++) {
                    FacilityBookingDto b = upcoming.get(i);
                    String facilityName = b.getFacilityName() != null ? b.getFacilityName() : "Tien ich";
                    String startTime = b.getStartTime() != null ? b.getStartTime().toString() : "Chua co lich";
                    String status = String.valueOf(b.getStatus());
                    String statusEmoji = "CONFIRMED".equalsIgnoreCase(status) ? "✅" :
                                      "PENDING".equalsIgnoreCase(status) ? "⏳" :
                                      "CANCELLED".equalsIgnoreCase(status) ? "❌" : "❓";
                    String statusText = "CONFIRMED".equalsIgnoreCase(status) ? "Da xac nhan" :
                                      "PENDING".equalsIgnoreCase(status) ? "Dang cho" :
                                      "CANCELLED".equalsIgnoreCase(status) ? "Da huy" : status;
                    
                    ctx.append(String.format("\n%d. %s %s luc %s (%s)", 
                        i + 1, statusEmoji, facilityName, startTime, statusText));
                }
                ctx.append(". ");
            }
            
            // Hiển thị lịch đặt đã qua với thông tin dễ hiểu
            List<FacilityBookingDto> past = myBookings.stream()
                .filter(b -> b.getStartTime() != null && b.getStartTime().isBefore(now))
                .sorted(Comparator.comparing(FacilityBookingDto::getStartTime).reversed())
                .collect(Collectors.toList());
            
            if (!past.isEmpty()) {
                ctx.append("\n" + "-".repeat(40));
                ctx.append("\n📅 LICH DAT DA QUA: ");
                ctx.append("📊 Tong so: " + past.size() + ". ");
                ctx.append("\n📋 DANH SACH LICH DAT: ");
                for (int i = 0; i < past.size(); i++) {
                    FacilityBookingDto b = past.get(i);
                    String facilityName = b.getFacilityName() != null ? b.getFacilityName() : "Tien ich";
                    String startTime = b.getStartTime() != null ? b.getStartTime().toString() : "Chua co lich";
                    String status = String.valueOf(b.getStatus());
                    String statusEmoji = "COMPLETED".equalsIgnoreCase(status) ? "✅" :
                                      "CANCELLED".equalsIgnoreCase(status) ? "❌" : "❓";
                    String statusText = "COMPLETED".equalsIgnoreCase(status) ? "Da hoan thanh" :
                                      "CANCELLED".equalsIgnoreCase(status) ? "Da huy" : status;
                    
                    ctx.append(String.format("\n%d. %s %s luc %s (%s)", 
                        i + 1, statusEmoji, facilityName, startTime, statusText));
                }
                ctx.append(". ");
            }
        }

        // Vehicles - TẤT CẢ xe
        try {
            Long userId = userOpt2.map(u -> u.getId()).orElse(null);
            if (userId != null) {
                var vehicles = vehicleService.getVehiclesByCurrentUser(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(username, "")
                );
                int vehicleCount = vehicles.size();
                if (vehicleCount > 0) {
                    ctx.append("\n" + "-".repeat(40));
                    ctx.append("\n🚗 SO XE DANG KY: ").append(vehicleCount).append(". ");
                    
                    // Hiển thị xe với thông tin dễ hiểu
                    ctx.append("\n📋 DANH SACH XE: ");
                    for (int i = 0; i < vehicles.size(); i++) {
                        var v = vehicles.get(i);
                        String licensePlate = String.valueOf(v.getLicensePlate());
                        String vehicleType = String.valueOf(v.getVehicleType());
                        String status = String.valueOf(v.getStatus());
                        String statusEmoji = "APPROVED".equalsIgnoreCase(status) ? "✅" :
                                          "PENDING".equalsIgnoreCase(status) ? "⏳" :
                                          "REJECTED".equalsIgnoreCase(status) ? "❌" : "❓";
                        String statusText = "APPROVED".equalsIgnoreCase(status) ? "Da duyet" :
                                          "PENDING".equalsIgnoreCase(status) ? "Dang cho duyet" :
                                          "REJECTED".equalsIgnoreCase(status) ? "Bi tu choi" : status;
                        
                        ctx.append(String.format("\n%d. %s %s - %s (%s)", 
                            i + 1, statusEmoji, licensePlate, vehicleType, statusText));
                    }
                    ctx.append(". ");
                }
            }
        } catch (Exception ignored) {}

        // Upcoming events - TẤT CẢ sự kiện
        try {
            var userEvents = eventService.getAllEventsForUser(username);
            int eventCount = userEvents.size();
            if (eventCount > 0) {
                ctx.append("\n" + "-".repeat(40));
                ctx.append("\n🎉 SU KIEN DA DANG KY: ").append(eventCount).append(". ");
                
                // TẤT CẢ sự kiện đã đăng ký
                ctx.append("\n📋 DANH SACH SU KIEN: ");
                for (int i = 0; i < userEvents.size(); i++) {
                    var e = userEvents.get(i);
                    String title = String.valueOf(e.getTitle());
                    String startTime = e.getStartTime() != null ? e.getStartTime().toString() : "Chua co lich";
                    String location = e.getLocation() != null ? String.valueOf(e.getLocation()) : "Chua co dia diem";
                    String registrationStatus = e.isRegistered() ? "Da dang ky" : "Chua dang ky";
                    String statusEmoji = e.isRegistered() ? "✅" : "❌";
                    
                    ctx.append(String.format("\n%d. %s %s luc %s tai %s (%s)", 
                        i + 1, statusEmoji, title, startTime, location, registrationStatus));
                }
                ctx.append(". ");
            }
        } catch (Exception ignored) {}

        // Support requests - TẤT CẢ yêu cầu hỗ trợ
        try {
            Long userId = userOpt2.map(u -> u.getId()).orElse(null);
            if (userId != null) {
                var mySupports = serviceRequestService.getServiceRequestsByUserId(userId);
                int supportCount = mySupports.size();
                if (supportCount > 0) {
                    ctx.append("\n" + "-".repeat(40));
                    ctx.append("\n🆘 YEU CAU HO TRO: ").append(supportCount).append(". ");
                    
                    // TẤT CẢ yêu cầu hỗ trợ theo thứ tự thời gian
                    ctx.append("\n📋 DANH SACH YEU CAU: ");
                    List<ServiceRequestDto> sortedSupports = mySupports.stream()
                        .sorted(Comparator.comparing(ServiceRequestDto::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                        .collect(Collectors.toList());
                    
                    for (int i = 0; i < sortedSupports.size(); i++) {
                        var sr = sortedSupports.get(i);
                        String title = String.valueOf(sr.getTitle());
                        String status = String.valueOf(sr.getStatus());
                        String statusEmoji = "OPEN".equalsIgnoreCase(status) ? "🔴" :
                                          "IN_PROGRESS".equalsIgnoreCase(status) ? "🟡" :
                                          "RESOLVED".equalsIgnoreCase(status) ? "✅" :
                                          "CLOSED".equalsIgnoreCase(status) ? "🔒" : "❓";
                        String statusText = "OPEN".equalsIgnoreCase(status) ? "Dang mo" :
                                          "IN_PROGRESS".equalsIgnoreCase(status) ? "Dang xu ly" :
                                          "RESOLVED".equalsIgnoreCase(status) ? "Da giai quyet" :
                                          "CLOSED".equalsIgnoreCase(status) ? "Da dong" : status;
                        String createdAt = sr.getCreatedAt() != null ? sr.getCreatedAt().toString() : "Chua co ngay";
                        
                        ctx.append(String.format("\n%d. %s %s (%s) - %s", 
                            i + 1, statusEmoji, title, statusText, createdAt));
                    }
                    ctx.append(". ");
                }
            }
        } catch (Exception ignored) {}

        // Announcements - TẤT CẢ thông báo
        try {
            var anns = announcementService.getAllAnnouncementsForUser(username);
            if (anns != null && !anns.isEmpty()) {
                long unread = announcementService.getUnreadCount(username);
                ctx.append("\n" + "-".repeat(40));
                ctx.append("\n📢 THONG BAO: ");
                ctx.append("📊 Tong so: " + anns.size() + " | ");
                ctx.append("📖 Chua doc: " + unread).append(". ");
                
                // TẤT CẢ thông báo theo thứ tự thời gian
                ctx.append("\n📋 DANH SACH THONG BAO: ");
                List<AnnouncementDto> sortedAnns = anns.stream()
                    .sorted(Comparator.comparing(AnnouncementDto::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
                
                for (int i = 0; i < sortedAnns.size(); i++) {
                    var a = sortedAnns.get(i);
                    String title = String.valueOf(a.getTitle());
                    String createdAt = a.getCreatedAt() != null ? a.getCreatedAt().toString() : "Chua co ngay";
                    String readStatus = a.isRead() ? "Da doc" : "Chua doc";
                    String readEmoji = a.isRead() ? "✅" : "🔴";
                    
                    ctx.append(String.format("\n%d. %s %s - %s (%s)", 
                        i + 1, readEmoji, title, createdAt, readStatus));
                }
                ctx.append(". ");
            }
        } catch (Exception ignored) {}

        return ctx.toString().trim();
    }
}


