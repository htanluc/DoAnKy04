package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.FacilityBookingCreateRequest;
import com.mytech.apartment.portal.dtos.FacilityBookingDto;
import com.mytech.apartment.portal.mappers.FacilityBookingMapper;
import com.mytech.apartment.portal.models.Facility;
import com.mytech.apartment.portal.models.FacilityBooking;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.FacilityBookingRepository;
import com.mytech.apartment.portal.repositories.FacilityRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.models.enums.FacilityBookingStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FacilityBookingService {
    private static final Logger log = LoggerFactory.getLogger(FacilityBookingService.class);
    
    @Autowired
    private FacilityBookingRepository facilityBookingRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacilityBookingMapper facilityBookingMapper;

    @Autowired
    private EmailService emailService;

    public List<FacilityBookingDto> getAllFacilityBookings() {
        return facilityBookingRepository.findAll().stream()
                .map(facilityBookingMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<FacilityBookingDto> getFacilityBookingById(Long id) {
        return facilityBookingRepository.findById(id).map(facilityBookingMapper::toDto);
    }

    public FacilityBookingDto createFacilityBooking(FacilityBookingCreateRequest request) {
        // Validate dữ liệu đầu vào
        if (request.getFacilityId() == null || request.getBookingTime() == null || request.getDuration() == null || request.getUserId() == null) {
            throw new RuntimeException("Thiếu thông tin đặt chỗ");
        }
        
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + request.getFacilityId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id " + request.getUserId()));

        // Parse bookingTime từ String sang LocalDateTime
        LocalDateTime bookingTime;
        try {
            bookingTime = LocalDateTime.parse(request.getBookingTime());
        } catch (Exception e) {
            throw new RuntimeException("Định dạng thời gian không hợp lệ. Vui lòng sử dụng format: yyyy-MM-ddTHH:mm:ss");
        }

        // Không cho phép đặt ở thời gian quá khứ
        if (bookingTime.isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Không thể đặt tiện ích ở thời gian quá khứ");
        }
        
        // Validate số người không vượt quá sức chứa
        if (request.getNumberOfPeople() != null && request.getNumberOfPeople() > facility.getCapacity()) {
            throw new RuntimeException("Số người vượt quá sức chứa của tiện ích");
        }
        
        // Validate thời lượng hợp lệ (>= 30 phút)
        if (request.getDuration() < 30) {
            throw new RuntimeException("Thời lượng đặt chỗ tối thiểu là 30 phút");
        }

        // Kiểm tra trùng lặp thời gian (chỉ kiểm tra slot bắt đầu, không kiểm tra slot kết thúc)
        LocalDateTime bookingStart = bookingTime;
        
        // Chỉ kiểm tra các booking có slot bắt đầu trùng với slot bắt đầu của booking mới
        List<FacilityBooking> conflictingBookings = facilityBookingRepository
            .findByFacilityIdAndBookingTimeBetween(request.getFacilityId(), bookingStart, bookingStart.plusMinutes(1));
        
        // Kiểm tra sức chứa tổng cộng cho slot bắt đầu
        int totalPeopleInTimeSlot = conflictingBookings.stream()
            .mapToInt(booking -> booking.getNumberOfPeople() != null ? booking.getNumberOfPeople() : 0)
            .sum();
        
        int requestedPeople = request.getNumberOfPeople() != null ? request.getNumberOfPeople() : 0;
        if (totalPeopleInTimeSlot + requestedPeople > facility.getCapacity()) {
            throw new RuntimeException("Sức chứa tiện ích không đủ cho số người yêu cầu");
        }

        FacilityBooking booking = new FacilityBooking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setBookingTime(bookingTime);
        booking.setEndTime(bookingTime.plusMinutes(request.getDuration())); // Tính endTime
        booking.setDuration(request.getDuration());
        booking.setStatus(FacilityBookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setNumberOfPeople(request.getNumberOfPeople());
        booking.setPurpose(request.getPurpose());
        
        // Tính toán totalCost
        double usageFee = facility.getUsageFee() != null ? facility.getUsageFee() : 0.0;
        int durationMinutes = request.getDuration();
        int numberOfPeople = request.getNumberOfPeople() != null ? request.getNumberOfPeople() : 1;
        double hours = durationMinutes / 60.0;
        double totalCost = usageFee * hours * numberOfPeople;
        booking.setTotalCost(totalCost);
        
        // Set payment status from request
        if (request.getPaymentStatus() != null && "PAID".equals(request.getPaymentStatus())) {
            // Chuyển status từ PENDING thành CONFIRMED khi thanh toán
            booking.setStatus(FacilityBookingStatus.CONFIRMED);
            booking.setPaymentStatus(com.mytech.apartment.portal.models.enums.PaymentStatus.PAID);
            
            // Convert payment method string to enum
            if (request.getPaymentMethod() != null) {
                try {
                    booking.setPaymentMethod(com.mytech.apartment.portal.models.enums.PaymentMethod.valueOf(request.getPaymentMethod()));
                } catch (IllegalArgumentException e) {
                    // Default to MOMO if invalid payment method
                    booking.setPaymentMethod(com.mytech.apartment.portal.models.enums.PaymentMethod.MOMO);
                }
            }
            
            booking.setPaymentDate(LocalDateTime.now());
            // Set totalCost from request if provided
            if (request.getTotalCost() != null) {
                booking.setTotalCost(request.getTotalCost());
            }
        } else {
            booking.setPaymentStatus(com.mytech.apartment.portal.models.enums.PaymentStatus.PENDING);
        }

        FacilityBooking savedBooking = facilityBookingRepository.save(booking);
        
        // Chỉ tạo QR code khi đã thanh toán
        if (savedBooking.getPaymentStatus() == com.mytech.apartment.portal.models.enums.PaymentStatus.PAID) {
            String qrCode = "FACILITY_" + savedBooking.getId() + "_" + System.currentTimeMillis();
            LocalDateTime expiresAt = savedBooking.getBookingTime().plusMinutes(savedBooking.getDuration()).plusHours(1);
            
            savedBooking.setQrCode(qrCode);
            savedBooking.setQrExpiresAt(expiresAt);
            savedBooking.setMaxCheckins(savedBooking.getNumberOfPeople());
            savedBooking.setCheckedInCount(0);
            
            savedBooking = facilityBookingRepository.save(savedBooking);
        }
        return facilityBookingMapper.toDto(savedBooking);
    }

    public Optional<FacilityBookingDto> updateFacilityBooking(Long id, FacilityBookingCreateRequest request) {
        return facilityBookingRepository.findById(id).map(booking -> {
            if (request.getFacilityId() != null) {
                Facility facility = facilityRepository.findById(request.getFacilityId())
                        .orElseThrow(() -> new RuntimeException("Facility not found with id " + request.getFacilityId()));
                booking.setFacility(facility);
            }
            if (request.getBookingTime() != null) {
                try {
                    LocalDateTime bookingTime = LocalDateTime.parse(request.getBookingTime());
                    booking.setBookingTime(bookingTime);
                } catch (Exception e) {
                    throw new RuntimeException("Định dạng thời gian không hợp lệ. Vui lòng sử dụng format: yyyy-MM-ddTHH:mm:ss");
                }
            }
            if (request.getDuration() != null) {
                booking.setDuration(request.getDuration());
            }
            if (request.getNumberOfPeople() != null) {
                booking.setNumberOfPeople(request.getNumberOfPeople());
            }
            if (request.getPurpose() != null) {
                booking.setPurpose(request.getPurpose());
            }

            FacilityBooking updatedBooking = facilityBookingRepository.save(booking);
            return facilityBookingMapper.toDto(updatedBooking);
        });
    }

    public boolean deleteFacilityBooking(Long id) {
        return facilityBookingRepository.findById(id).map(booking -> {
            // Chỉ cho phép huỷ nếu trạng thái là PENDING hoặc CONFIRMED và chưa bắt đầu
            LocalDateTime now = LocalDateTime.now();
            if ((booking.getStatus() == FacilityBookingStatus.PENDING || booking.getStatus() == FacilityBookingStatus.CONFIRMED)
                && booking.getBookingTime().isAfter(now)) {
                facilityBookingRepository.deleteById(id);
                return true;
            } else {
                throw new RuntimeException("Chỉ có thể huỷ booking khi trạng thái là PENDING hoặc CONFIRMED và chưa đến thời gian bắt đầu");
            }
        }).orElse(false);
    }

    public List<FacilityBookingDto> getFacilityBookingsByUserId(Long userId) {
        return facilityBookingRepository.findByUserId(userId).stream()
            .map(facilityBookingMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<FacilityBookingDto> getBookingsByFacilityAndDate(Long facilityId, java.time.LocalDate date) {
        java.time.LocalDateTime start = date.atStartOfDay();
        java.time.LocalDateTime end = date.plusDays(1).atStartOfDay();
        return facilityBookingRepository.findByFacilityIdAndBookingTimeBetween(facilityId, start, end)
            .stream()
            .map(facilityBookingMapper::toDto)
            .collect(java.util.stream.Collectors.toList());
    }

    // Lấy thông tin sức chứa theo từng giờ trong ngày
    public java.util.Map<String, Object> getFacilityAvailabilityByHour(Long facilityId, java.time.LocalDate date) {
        Facility facility = facilityRepository.findById(facilityId)
            .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        // Lấy tất cả booking trong ngày
        List<FacilityBooking> dayBookings = getBookingsByFacilityAndDate(facilityId, date)
            .stream()
            .map(dto -> facilityBookingRepository.findById(dto.getId()).orElse(null))
            .filter(booking -> booking != null)
            .collect(java.util.stream.Collectors.toList());
        
        // Tạo map theo giờ để lưu capacity đã sử dụng (0-23)
        java.util.Map<Integer, Integer> usedCapacityByHour = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> bookingCountByHour = new java.util.HashMap<>();
        for (int hour = 0; hour < 24; hour++) {
            usedCapacityByHour.put(hour, 0);
            bookingCountByHour.put(hour, 0);
        }
        
        // Tính capacity cho từng giờ - nhóm booking theo slot và tính tổng người dùng
        for (int hour = 0; hour < 24; hour++) {
            final int currentHour = hour;
            
            // Lấy tất cả booking đang hoạt động trong slot này
            List<FacilityBooking> activeBookingsInSlot = dayBookings.stream()
                .filter(booking -> {
                    LocalDateTime start = booking.getBookingTime();
                    LocalDateTime end = booking.getEndTime();
                    
                    if (start != null && end != null) {
                        // Kiểm tra booking có bao phủ slot này không
                        LocalDateTime slotStart = start.toLocalDate().atTime(currentHour, 0);
                        LocalDateTime slotEnd = slotStart.plusHours(1);
                        return start.isBefore(slotEnd) && end.isAfter(slotStart);
                    } else if (start != null) {
                        // Fallback cho booking chỉ có startTime
                        return start.getHour() == currentHour;
                    }
                    return false;
                })
                .collect(java.util.stream.Collectors.toList());
            
            // Tính tổng số người trong slot này
            int totalPeopleInSlot = activeBookingsInSlot.stream()
                .mapToInt(booking -> booking.getNumberOfPeople() != null ? booking.getNumberOfPeople() : 0)
                .sum();
            
            usedCapacityByHour.put(hour, totalPeopleInSlot);
            bookingCountByHour.put(hour, activeBookingsInSlot.size());
        }
        
        // Tính toán sức chứa theo giờ
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("facilityId", facilityId);
        result.put("facilityName", facility.getName());
        result.put("totalCapacity", facility.getCapacity());
        result.put("date", date.toString());
        
        java.util.List<java.util.Map<String, Object>> hourlyData = new java.util.ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            int usedCapacity = usedCapacityByHour.get(hour);
            int availableCapacity = facility.getCapacity() - usedCapacity;
            int bookingCount = bookingCountByHour.get(hour);
            
            java.util.Map<String, Object> hourInfo = new java.util.HashMap<>();
            hourInfo.put("hour", hour);
            hourInfo.put("usedCapacity", usedCapacity);
            hourInfo.put("availableCapacity", availableCapacity);
            hourInfo.put("isAvailable", availableCapacity > 0);
            hourInfo.put("bookingCount", bookingCount);
            
            hourlyData.add(hourInfo);
        }
        result.put("hourlyData", hourlyData);
        
        return result;
    }
    
    // Khởi tạo thanh toán cho facility booking (tạo payment URL)
    public Map<String, Object> initiatePayment(Long bookingId, Long userId, String paymentMethod) {
        FacilityBooking booking = facilityBookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));
        
        // Kiểm tra quyền sở hữu
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thanh toán cho booking này");
        }
        
        // Kiểm tra trạng thái booking
        if (booking.getStatus() != FacilityBookingStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể thanh toán cho booking có trạng thái PENDING");
        }
        
        // Kiểm tra trạng thái thanh toán
        if (booking.getPaymentStatus() == com.mytech.apartment.portal.models.enums.PaymentStatus.PAID) {
            throw new RuntimeException("Booking này đã được thanh toán");
        }
        
        // Tạo orderId và orderInfo cho payment gateway
        String orderId = "FACILITY_" + bookingId;
        String orderInfo = "Thanh toan dat " + booking.getFacility().getName() + " - " + 
                          booking.getBookingTime().toLocalDate() + " " + 
                          booking.getBookingTime().toLocalTime().toString().substring(0, 5);
        
        // Trả về thông tin để frontend gọi payment gateway
        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("amount", booking.getTotalCost().longValue());
        result.put("orderInfo", orderInfo);
        result.put("bookingId", bookingId);
        result.put("paymentMethod", paymentMethod);
        result.put("returnUrl", "http://localhost:8080/api/facility-bookings/payment-callback");
        
        return result;
    }
    
    // Xử lý thanh toán cho facility booking (cập nhật sau khi payment gateway callback)
    public FacilityBookingDto processPayment(Long bookingId, Long userId, String paymentMethod) {
        FacilityBooking booking = facilityBookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));
        
        // Kiểm tra quyền sở hữu
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thanh toán cho booking này");
        }
        
        // Kiểm tra trạng thái booking
        if (booking.getStatus() != FacilityBookingStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể thanh toán cho booking có trạng thái PENDING");
        }
        
        // Kiểm tra trạng thái thanh toán
        if (booking.getPaymentStatus() == com.mytech.apartment.portal.models.enums.PaymentStatus.PAID) {
            throw new RuntimeException("Booking này đã được thanh toán");
        }
        
        // Cập nhật trạng thái thanh toán
        try {
            booking.setPaymentMethod(com.mytech.apartment.portal.models.enums.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
            booking.setPaymentStatus(com.mytech.apartment.portal.models.enums.PaymentStatus.PAID);
            booking.setPaymentDate(LocalDateTime.now());
            booking.setTransactionId("TXN_" + System.currentTimeMillis());
            
            // Cập nhật trạng thái booking thành CONFIRMED
            booking.setStatus(FacilityBookingStatus.CONFIRMED);
            
            FacilityBooking savedBooking = facilityBookingRepository.save(booking);
            return facilityBookingMapper.toDto(savedBooking);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ: " + paymentMethod);
        }
    }
    
    // Admin cập nhật trạng thái thanh toán
    public FacilityBookingDto updatePaymentStatus(Long bookingId, String paymentStatus, String paymentMethod) {
        FacilityBooking booking = facilityBookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));
        
        try {
            com.mytech.apartment.portal.models.enums.PaymentStatus status = 
                com.mytech.apartment.portal.models.enums.PaymentStatus.valueOf(paymentStatus.toUpperCase());
            
            booking.setPaymentStatus(status);
            
            if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
                try {
                    com.mytech.apartment.portal.models.enums.PaymentMethod method = 
                        com.mytech.apartment.portal.models.enums.PaymentMethod.valueOf(paymentMethod.toUpperCase());
                    booking.setPaymentMethod(method);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Phương thức thanh toán không hợp lệ: " + paymentMethod);
                }
            }
            
            if (status == com.mytech.apartment.portal.models.enums.PaymentStatus.PAID) {
                booking.setPaymentDate(LocalDateTime.now());
                if (booking.getTransactionId() == null) {
                    booking.setTransactionId("ADMIN_" + System.currentTimeMillis());
                }
            }
            
            FacilityBooking savedBooking = facilityBookingRepository.save(booking);
            return facilityBookingMapper.toDto(savedBooking);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái thanh toán không hợp lệ: " + paymentStatus);
        }
    }

    // Admin cập nhật trạng thái booking (phê duyệt / từ chối). Nếu từ chối thì gửi email với lý do.
    public FacilityBookingDto updateBookingStatus(Long bookingId, String status, String rejectionReason) {
        FacilityBooking booking = facilityBookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        FacilityBookingStatus newStatus;
        try {
            String normalized = status != null ? status.trim().toUpperCase() : "";
            if ("APPROVED".equals(normalized)) normalized = "CONFIRMED"; // đồng bộ enum BE
            newStatus = FacilityBookingStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }

        // Không cho phép từ chối nếu đã phê duyệt hoặc đã hoàn tất
        if ((booking.getStatus() == FacilityBookingStatus.CONFIRMED ||
             booking.getStatus() == FacilityBookingStatus.COMPLETED) &&
            newStatus == FacilityBookingStatus.REJECTED) {
            throw new RuntimeException("Không thể từ chối khi booking đã được phê duyệt hoặc đã hoàn tất");
        }

        booking.setStatus(newStatus);
        FacilityBooking saved = facilityBookingRepository.save(booking);

        // Gửi email khi từ chối
        if (newStatus == FacilityBookingStatus.REJECTED) {
            try {
                User user = saved.getUser();
                if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
                    String email = user.getEmail();
                    String subject = "Đặt tiện ích bị từ chối";
                    String content = String.format(
                        "<p>Chào %s,</p>" +
                        "<p>Yêu cầu đặt tiện ích của bạn đã bị <b>TỪ CHỐI</b>.</p>" +
                        "<ul>" +
                        "<li>Tiện ích: <b>%s</b></li>" +
                        "<li>Thời gian: <b>%s</b></li>" +
                        "</ul>" +
                        (rejectionReason != null && !rejectionReason.isBlank() ? ("<p>Lý do: " + rejectionReason + "</p>") : "") +
                        "<p>Vui lòng liên hệ ban quản lý nếu cần hỗ trợ.</p>",
                        (user.getFullName() != null ? user.getFullName() : user.getUsername()),
                        saved.getFacility() != null ? saved.getFacility().getName() : "-",
                        saved.getBookingTime() != null ? saved.getBookingTime().toString() : "-");
                    emailService.sendHtmlEmail(email, subject, content);
                }
            } catch (Exception ignored) {}
        }

        return facilityBookingMapper.toDto(saved);
    }

    /**
     * Cập nhật trạng thái thanh toán cho booking
     */
    public FacilityBookingDto updatePaymentStatus(
            Long bookingId,
            String paymentStatus,
            String paymentMethod,
            Double totalCost,
            String transactionId) {
        
        log.info("DEBUG: Updating payment status for booking ID: {}", bookingId);
        log.info("DEBUG: Payment status: {}, method: {}, cost: {}", paymentStatus, paymentMethod, totalCost);
        
        FacilityBooking booking;
        try {
            booking = facilityBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với ID: " + bookingId));
                
            log.info("DEBUG: Found booking: {} - {}", booking.getId(), booking.getFacility() != null ? booking.getFacility().getName() : "Unknown");
        } catch (Exception e) {
            log.error("DEBUG: Error finding booking: {}", e.getMessage(), e);
            throw e;
        }

        // Cập nhật trạng thái booking thành CONFIRMED khi thanh toán thành công
        if ("PAID".equals(paymentStatus)) {
            // Chuyển status từ PENDING thành CONFIRMED
            booking.setStatus(com.mytech.apartment.portal.models.enums.FacilityBookingStatus.CONFIRMED);
            
            // Set payment info
            booking.setPaymentStatus(com.mytech.apartment.portal.models.enums.PaymentStatus.PAID);
            
            // Convert payment method string to enum
            if (paymentMethod != null) {
                try {
                    booking.setPaymentMethod(com.mytech.apartment.portal.models.enums.PaymentMethod.valueOf(paymentMethod));
                } catch (IllegalArgumentException e) {
                    // Default to MOMO if invalid payment method
                    booking.setPaymentMethod(com.mytech.apartment.portal.models.enums.PaymentMethod.MOMO);
                }
            }
            
            booking.setPaymentDate(LocalDateTime.now());
            if (totalCost != null) {
                booking.setTotalCost(totalCost);
            }
            if (transactionId != null) {
                booking.setTransactionId(transactionId);
            }

            // Tạo QR code sau khi thanh toán thành công
            String qrCode = "FACILITY_" + booking.getId() + "_" + System.currentTimeMillis();
            
            // Tính thời gian hết hạn QR code - sử dụng bookingTime và endTime
            LocalDateTime expiresAt;
            if (booking.getBookingTime() != null && booking.getEndTime() != null) {
                expiresAt = booking.getEndTime().plusHours(1);
            } else if (booking.getBookingTime() != null && booking.getDuration() != null) {
                // Fallback: tính endTime từ bookingTime + duration
                expiresAt = booking.getBookingTime().plusMinutes(booking.getDuration()).plusHours(1);
            } else {
                // Fallback cuối cùng nếu không có thời gian
                expiresAt = LocalDateTime.now().plusDays(1);
            }

            booking.setQrCode(qrCode);
            booking.setQrExpiresAt(expiresAt);
            booking.setMaxCheckins(booking.getNumberOfPeople());
            booking.setCheckedInCount(0);

            log.info("QR code generated for booking {}: {}", booking.getId(), qrCode);
        }

        FacilityBooking savedBooking = facilityBookingRepository.save(booking);
        return facilityBookingMapper.toDto(savedBooking);
    }
} 