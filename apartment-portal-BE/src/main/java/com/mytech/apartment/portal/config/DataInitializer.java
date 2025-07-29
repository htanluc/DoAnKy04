package com.mytech.apartment.portal.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import com.mytech.apartment.portal.models.*;
import com.mytech.apartment.portal.models.enums.*;
import com.mytech.apartment.portal.repositories.*;
import com.mytech.apartment.portal.repositories.FeedbackCategoryRepository;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import java.math.BigDecimal;
import java.time.YearMonth;
import com.mytech.apartment.portal.models.WaterMeterReading;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private BuildingRepository buildingRepository;
    @Autowired private ApartmentRepository apartmentRepository;
    @Autowired private ResidentRepository residentRepository;
    @Autowired private ApartmentResidentRepository apartmentResidentRepository;
    @Autowired private FacilityRepository facilityRepository;
    @Autowired private ServiceCategoryRepository serviceCategoryRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private EventRegistrationRepository eventRegistrationRepository;
    @Autowired private FacilityBookingRepository facilityBookingRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private InvoiceItemRepository invoiceItemRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ServiceRequestRepository serviceRequestRepository;
    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private AiQaHistoryRepository aiQaHistoryRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private FeedbackCategoryRepository feedbackCategoryRepository;
    @Autowired private WaterMeterReadingRepository waterMeterReadingRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Roles
        Role adminRole = roleRepository.save(Role.builder().name("ADMIN").description("Quản trị viên hệ thống - Toàn quyền truy cập").build());
        Role staffRole = roleRepository.save(Role.builder().name("STAFF").description("Nhân viên quản lý - Quản lý căn hộ và dịch vụ").build());
        Role residentRole = roleRepository.save(Role.builder().name("RESIDENT").description("Cư dân - Sử dụng dịch vụ và thanh toán").build());
        Role technicianRole = roleRepository.save(Role.builder().name("TECHNICIAN").description("Kỹ thuật viên - Xử lý sự cố kỹ thuật").build());
        Role cleanerRole = roleRepository.save(Role.builder().name("CLEANER").description("Nhân viên vệ sinh - Dọn dẹp và bảo trì").build());
        Role securityRole = roleRepository.save(Role.builder().name("SECURITY").description("Bảo vệ - An ninh và tuần tra").build());

        // 2. Users - Kiểm tra tồn tại trước khi tạo
        List<User> users = new ArrayList<>();
        
        // Tạo user admin nếu chưa tồn tại
        User adminUser = userRepository.findByEmail("admin@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder()
                .username("admin")
                .email("admin@apartment.com")
                .passwordHash(passwordEncoder.encode("password"))
                .phoneNumber("0901234567")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(adminRole))
                .build()));
        users.add(adminUser);
        
        // Tạo các user khác nếu chưa tồn tại
        users.add(userRepository.findByEmail("manager@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder().username("manager").email("manager@apartment.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234568").status(UserStatus.ACTIVE).roles(Set.of(adminRole)).build())));
        users.add(userRepository.findByEmail("staff1@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder().username("staff1").email("staff1@apartment.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234569").status(UserStatus.ACTIVE).roles(Set.of(staffRole)).build())));
        users.add(userRepository.findByEmail("staff2@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder().username("staff2").email("staff2@apartment.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234570").status(UserStatus.ACTIVE).roles(Set.of(staffRole)).build())));
        users.add(userRepository.findByEmail("nguyenvanA@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident1").email("nguyenvanA@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234571").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("tranthiB@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident2").email("tranthiB@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234572").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("levanC@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident3").email("levanC@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234573").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("phamthiD@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident4").email("phamthiD@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234574").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("hoangvanE@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident5").email("hoangvanE@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234575").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("dangthiF@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident6").email("dangthiF@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234576").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("technician1@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder().username("technician1").email("technician1@apartment.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234577").status(UserStatus.ACTIVE).roles(Set.of(technicianRole)).build())));
        users.add(userRepository.findByEmail("cleaner1@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder().username("cleaner1").email("cleaner1@apartment.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234578").status(UserStatus.ACTIVE).roles(Set.of(cleanerRole)).build())));
        users.add(userRepository.findByEmail("security1@apartment.com")
            .orElseGet(() -> userRepository.save(User.builder().username("security1").email("security1@apartment.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234579").status(UserStatus.ACTIVE).roles(Set.of(securityRole)).build())));

        // Thêm resident bị khóa, resident inactive
        users.add(userRepository.findByEmail("locked@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident_locked").email("locked@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234580").status(UserStatus.LOCKED).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("inactive@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident_inactive").email("inactive@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234581").status(UserStatus.INACTIVE).roles(Set.of(residentRole)).build())));

        // 3. Buildings
        Building buildingA = buildingRepository.save(Building.builder().buildingName("Tòa A").address("123 Đường ABC, Quận 1, TP.HCM").floors(20).description("Tòa nhà cao cấp với đầy đủ tiện ích").build());
        Building buildingB = buildingRepository.save(Building.builder().buildingName("Tòa B").address("456 Đường XYZ, Quận 2, TP.HCM").floors(15).description("Tòa nhà trung cấp phù hợp gia đình").build());
        Building buildingC = buildingRepository.save(Building.builder().buildingName("Tòa C").address("789 Đường DEF, Quận 3, TP.HCM").floors(25).description("Tòa nhà cao cấp view đẹp").build());

        // 4. Apartments
        List<Apartment> apartments = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            apartments.add(apartmentRepository.save(Apartment.builder().buildingId(buildingA.getId()).floorNumber((i + 1) / 2).unitNumber("A" + ((i + 1) / 2) + "-" + String.format("%02d", i)).area(75.0 + (i * 5.0)).status(i % 3 == 0 ? ApartmentStatus.VACANT : ApartmentStatus.OCCUPIED).build()));
        }
        for (int i = 1; i <= 10; i++) {
            apartments.add(apartmentRepository.save(Apartment.builder().buildingId(buildingB.getId()).floorNumber((i + 1) / 2).unitNumber("B" + ((i + 1) / 2) + "-" + String.format("%02d", i)).area(65.0 + (i * 5.0)).status(i % 4 == 0 ? ApartmentStatus.VACANT : ApartmentStatus.OCCUPIED).build()));
        }
        for (int i = 1; i <= 10; i++) {
            apartments.add(apartmentRepository.save(Apartment.builder().buildingId(buildingC.getId()).floorNumber((i + 1) / 2).unitNumber("C" + ((i + 1) / 2) + "-" + String.format("%02d", i)).area(90.0 + (i * 5.0)).status(i % 3 == 0 ? ApartmentStatus.VACANT : ApartmentStatus.OCCUPIED).build()));
        }

        // SAU KHI TẠO APARTMENT, KHỞI TẠO CHỈ SỐ NƯỚC = 0 CHO THÁNG HIỆN TẠI (mapping thủ công)
        String currentMonth = YearMonth.now().toString(); // "yyyy-MM"
        for (Apartment apartment : apartments) {
            boolean exists = waterMeterReadingRepository.findByApartmentIdAndReadingMonth(apartment.getId().intValue(), currentMonth).isPresent();
            if (!exists) {
                WaterMeterReading entity = new WaterMeterReading();
                entity.setApartmentId(apartment.getId().intValue());
                entity.setReadingMonth(currentMonth);
                entity.setPreviousReading(BigDecimal.ZERO);
                entity.setCurrentReading(BigDecimal.ZERO);
                entity.setCreatedAt(LocalDateTime.now());
                // consumption sẽ tự tính qua @PrePersist
                waterMeterReadingRepository.save(entity);
            }
        }

        // 5. Residents
        String[] names = {"Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E", "Đặng Thị F"};
        List<Resident> residents = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            Resident resident = Resident.builder().userId(users.get(4 + i).getId()).fullName(names[i]).dateOfBirth(LocalDate.of(1985 + i, 3 + i, 15 + i)).idCardNumber("123456789" + String.format("%03d", i + 12)).familyRelation("Chủ hộ").status(1).build();
            residents.add(residentRepository.save(resident));
        }
        
        // Thêm resident bị khóa và inactive
        Resident lockedResident = residentRepository.save(Resident.builder().userId(users.get(users.size()-2).getId()).fullName("Nguyễn Văn Locked").dateOfBirth(LocalDate.of(1990,1,1)).idCardNumber("999999999999").familyRelation("Chủ hộ").status(0).build());
        Resident inactiveResident = residentRepository.save(Resident.builder().userId(users.get(users.size()-1).getId()).fullName("Trần Thị Inactive").dateOfBirth(LocalDate.of(1991,2,2)).idCardNumber("888888888888").familyRelation("Chủ hộ").status(0).build());
        residents.add(lockedResident);
        residents.add(inactiveResident);

        // 6. Apartment Residents (liên kết resident với apartment)
        for (int i = 0; i < residents.size() && i < apartments.size(); i++) {
            apartmentResidentRepository.save(ApartmentResident.builder()
                .id(new ApartmentResidentId(apartments.get(i).getId(), residents.get(i).getUserId()))
                .moveInDate(LocalDate.now().minusMonths(6 + i))
                .relationType("OWNER")
                .build());
        }

        // 7. Facilities
        List<Facility> facilities = new ArrayList<>();
        facilities.add(facilityRepository.save(Facility.builder().name("Phòng Gym").description("Phòng tập thể dục với đầy đủ thiết bị hiện đại").capacity(20).otherDetails("Mở cửa 6:00-22:00, có huấn luyện viên").usageFee(50000.0).openingHours("06:00 - 22:00").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Hồ bơi").description("Hồ bơi ngoài trời với view đẹp").capacity(50).otherDetails("Mở cửa 6:00-21:00, có cứu hộ").usageFee(100000.0).openingHours("06:00 - 21:00").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Phòng họp").description("Phòng họp đa năng cho cư dân").capacity(30).otherDetails("Có thể đặt trước, có máy chiếu").usageFee(30000.0).openingHours("08:00 - 20:00").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Sân tennis").description("Sân tennis ngoài trời chất lượng cao").capacity(8).otherDetails("Có đèn chiếu sáng, có thể chơi ban đêm").usageFee(80000.0).openingHours("06:00 - 22:00").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Khu BBQ").description("Khu vực nướng BBQ ngoài trời").capacity(40).otherDetails("Có bàn ghế, lò nướng").usageFee(50000.0).openingHours("16:00 - 22:00").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Phòng sinh hoạt cộng đồng").description("Phòng đa năng cho các hoạt động cộng đồng").capacity(100).otherDetails("Có sân khấu, âm thanh ánh sáng").usageFee(20000.0).openingHours("08:00 - 22:00").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Bãi đỗ xe").description("Bãi đỗ xe có mái che").capacity(200).otherDetails("Miễn phí cho cư dân").usageFee(10000.0).openingHours("24/7").build()));
        facilities.add(facilityRepository.save(Facility.builder().name("Khu vui chơi trẻ em").description("Sân chơi an toàn cho trẻ em").capacity(30).otherDetails("Có đồ chơi, có ghế ngồi cho phụ huynh").usageFee(30000.0).openingHours("06:00 - 20:00").build()));

        // 8. Service Categories
        List<ServiceCategory> serviceCategories = new ArrayList<>();
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("ELECTRICITY").categoryName("Điện").assignedRole("TECHNICIAN").description("Sửa chữa điện, thay bóng đèn, ổ cắm").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("PLUMBING").categoryName("Nước").assignedRole("TECHNICIAN").description("Sửa ống nước, vòi nước, bồn cầu").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("CLEANING").categoryName("Vệ sinh").assignedRole("CLEANER").description("Dọn dẹp, lau chùi, vệ sinh chung").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("SECURITY").categoryName("An ninh").assignedRole("SECURITY").description("Tuần tra, kiểm tra an ninh, xử lý sự cố").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("HVAC").categoryName("Điều hòa").assignedRole("TECHNICIAN").description("Bảo trì, sửa chữa điều hòa").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("ELEVATOR").categoryName("Thang máy").assignedRole("TECHNICIAN").description("Bảo trì, sửa chữa thang máy").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("GARDENING").categoryName("Cây xanh").assignedRole("CLEANER").description("Chăm sóc cây xanh, cắt tỉa").build()));
        serviceCategories.add(serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("GENERAL").categoryName("Khác").assignedRole("STAFF").description("Các yêu cầu khác").build()));

        // 9. Feedback Categories
        List<FeedbackCategory> feedbackCategories = new ArrayList<>();
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder().categoryCode("SUGGESTION").categoryName("Đề xuất").description("Đề xuất cải tiến").build()));
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder().categoryCode("COMPLAINT").categoryName("Khiếu nại").description("Khiếu nại về dịch vụ").build()));
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder().categoryCode("COMPLIMENT").categoryName("Khen ngợi").description("Khen ngợi dịch vụ").build()));

        // 10. Announcements
        User admin = users.get(0);
        announcementRepository.save(Announcement.builder()
            .title("Thông báo bảo trì thang máy")
            .content("Thang máy tòa A sẽ được bảo trì từ 8:00-12:00 ngày 15/12/2024. Vui lòng sử dụng thang máy khác.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(admin.getId())
            .isActive(true)
            .createdAt(LocalDateTime.now())
            .build());
        announcementRepository.save(Announcement.builder()
            .title("Thông báo khẩn: Mất điện")
            .content("Sẽ có kế hoạch cắt điện bảo trì từ 22:00-06:00 ngày 20/12/2024. Vui lòng chuẩn bị đèn pin.")
            .type("URGENT")
            .targetAudience("ALL")
            .createdBy(admin.getId())
            .isActive(true)
            .createdAt(LocalDateTime.now())
            .build());
        announcementRepository.save(Announcement.builder().title("Sự kiện Tết 2025").content("Chương trình đón Tết 2025 sẽ diễn ra tại sảnh chính từ 18:00-22:00 ngày 30/12/2024. Mời tất cả cư dân tham gia.").type("EVENT").targetAudience("ALL").createdBy(admin.getId()).isActive(true).createdAt(LocalDateTime.now()).build());
        announcementRepository.save(Announcement.builder().title("Thông báo về phí dịch vụ").content("Phí dịch vụ tháng 12/2024 sẽ tăng 5% do chi phí điện nước tăng. Vui lòng thanh toán đúng hạn.").type("REGULAR").targetAudience("ALL").createdBy(admin.getId()).isActive(true).createdAt(LocalDateTime.now()).build());
        announcementRepository.save(Announcement.builder().title("Bảo trì hệ thống nước").content("Hệ thống nước sẽ được bảo trì từ 14:00-18:00 ngày 25/12/2024. Vui lòng dự trữ nước.").type("REGULAR").targetAudience("ALL").createdBy(admin.getId()).isActive(true).createdAt(LocalDateTime.now()).build());

        // 11. Events
        List<Event> events = new ArrayList<>();
        events.add(eventRepository.save(Event.builder()
            .title("Tiệc Giáng sinh 2024")
            .description("Tiệc Giáng sinh cho cư dân với nhiều hoạt động vui nhộn")
            .startTime(LocalDateTime.of(2024,12,24,18,0))
            .endTime(LocalDateTime.of(2024,12,24,22,0))
            .location("Sảnh chính tòa A")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Họp cư dân tháng 12")
            .description("Họp cư dân định kỳ để thảo luận các vấn đề chung")
            .startTime(LocalDateTime.of(2024,12,15,19,0))
            .endTime(LocalDateTime.of(2024,12,15,21,0))
            .location("Phòng sinh hoạt cộng đồng")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Lớp yoga miễn phí")
            .description("Lớp yoga miễn phí cho cư dân mỗi sáng Chủ nhật")
            .startTime(LocalDateTime.of(2024,12,22,7,0))
            .endTime(LocalDateTime.of(2024,12,22,8,30))
            .location("Phòng gym")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Workshop nấu ăn")
            .description("Workshop nấu ăn truyền thống Việt Nam")
            .startTime(LocalDateTime.of(2024,12,28,14,0))
            .endTime(LocalDateTime.of(2024,12,28,17,0))
            .location("Khu BBQ")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Giải tennis cư dân")
            .description("Giải đấu tennis thường niên cho cư dân")
            .startTime(LocalDateTime.of(2024,12,29,8,0))
            .endTime(LocalDateTime.of(2024,12,29,18,0))
            .location("Sân tennis")
            .createdAt(LocalDateTime.now())
            .build()));

        // 12. Event Registrations
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(0)).residentId(residents.get(0).getId()).status(EventRegistrationStatus.REGISTERED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(0)).residentId(residents.get(1).getId()).status(EventRegistrationStatus.ATTENDED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(0)).residentId(residents.get(2).getId()).status(EventRegistrationStatus.CANCELLED).build());

        // 13. Facility Bookings
        User residentUser = users.get(4);
        facilityBookingRepository.save(FacilityBooking.builder().facility(facilities.get(0)).user(residentUser).bookingTime(LocalDateTime.now().plusDays(1)).duration(60).status(FacilityBookingStatus.PENDING).createdAt(LocalDateTime.now()).numberOfPeople(2).build());
        facilityBookingRepository.save(FacilityBooking.builder().facility(facilities.get(0)).user(residentUser).bookingTime(LocalDateTime.now().plusDays(2)).duration(60).status(FacilityBookingStatus.REJECTED).createdAt(LocalDateTime.now()).numberOfPeople(4).build());
        facilityBookingRepository.save(FacilityBooking.builder().facility(facilities.get(1)).user(users.get(5)).bookingTime(LocalDateTime.now().plusDays(3)).duration(90).status(FacilityBookingStatus.CONFIRMED).approvedBy(admin).approvedAt(LocalDateTime.now()).createdAt(LocalDateTime.now()).numberOfPeople(6).build());

        // BỔ SUNG: Facility booking cho userId=8 (Phạm Thị D)
        User phamThiD = users.stream().filter(u -> u.getUsername().equals("resident4")).findFirst().orElse(null);
        if (phamThiD != null && !facilities.isEmpty()) {
            facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facilities.get(2))
                .user(phamThiD)
                .bookingTime(LocalDateTime.now().plusDays(2))
                .duration(90)
                .status(FacilityBookingStatus.CONFIRMED)
                .createdAt(LocalDateTime.now())
                .numberOfPeople(3)
                .build());
            facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facilities.get(3))
                .user(phamThiD)
                .bookingTime(LocalDateTime.now().plusDays(3))
                .duration(60)
                .status(FacilityBookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .numberOfPeople(5)
                .build());
        }

        // 14. Invoices & Invoice Items
        for (Resident resident : residents) {
            List<ApartmentResident> links = apartmentResidentRepository.findByIdUserId(resident.getUserId());
            if (links.isEmpty()) continue;
            Long apartmentId = links.get(0).getApartmentId();
            
            // unpaid
            Invoice unpaid = invoiceRepository.save(Invoice.builder().apartmentId(apartmentId).billingPeriod("2024-11").issueDate(LocalDate.of(2024,11,1)).dueDate(LocalDate.of(2024,11,15)).totalAmount(1000000.0).status(InvoiceStatus.UNPAID).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
            // paid
            Invoice paid = invoiceRepository.save(Invoice.builder().apartmentId(apartmentId).billingPeriod("2024-10").issueDate(LocalDate.of(2024,10,1)).dueDate(LocalDate.of(2024,10,15)).totalAmount(900000.0).status(InvoiceStatus.PAID).createdAt(LocalDateTime.now().minusMonths(2)).updatedAt(LocalDateTime.now().minusMonths(1)).build());
            // overdue
            Invoice overdue = invoiceRepository.save(Invoice.builder().apartmentId(apartmentId).billingPeriod("2024-09").issueDate(LocalDate.of(2024,9,1)).dueDate(LocalDate.of(2024,9,15)).totalAmount(1200000.0).status(InvoiceStatus.OVERDUE).createdAt(LocalDateTime.now().minusMonths(3)).updatedAt(LocalDateTime.now().minusMonths(2)).build());
            
            // Thêm invoice item cho mỗi invoice
            for (Invoice inv : List.of(unpaid, paid, overdue)) {
                invoiceItemRepository.save(InvoiceItem.builder().invoice(inv).feeType("ELECTRICITY").description("Phí điện").amount(300000.0).build());
                invoiceItemRepository.save(InvoiceItem.builder().invoice(inv).feeType("WATER").description("Phí nước").amount(200000.0).build());
                invoiceItemRepository.save(InvoiceItem.builder().invoice(inv).feeType("PARKING").description("Phí giữ xe").amount(150000.0).build());
                invoiceItemRepository.save(InvoiceItem.builder().invoice(inv).feeType("INTERNET").description("Phí mạng").amount(100000.0).build());
                invoiceItemRepository.save(InvoiceItem.builder().invoice(inv).feeType("MAINTENANCE").description("Phí bảo trì").amount(250000.0).build());
            }
        }

        // 15. Payments
        List<Invoice> paidInvoices = invoiceRepository.findByStatus(InvoiceStatus.PAID);
        for (Invoice inv : paidInvoices) {
            paymentRepository.save(Payment.builder().invoice(inv).paidByUserId(users.get(4).getId()).paymentDate(LocalDateTime.now().minusDays(10)).amount(inv.getTotalAmount()).method(PaymentMethod.BANK_TRANSFER).status(PaymentStatus.SUCCESS).referenceCode("TXN"+inv.getId()).build());
        }

        // 16. Service Requests
        serviceRequestRepository.save(ServiceRequest.builder().user(residentUser).category(serviceCategories.get(0)).description("Cần sửa ống nước").submittedAt(LocalDateTime.now()).status(ServiceRequestStatus.OPEN).priority(ServiceRequestPriority.P2).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(residentUser).category(serviceCategories.get(1)).description("Cần sửa điện").submittedAt(LocalDateTime.now()).status(ServiceRequestStatus.COMPLETED).priority(ServiceRequestPriority.P1).resolutionNotes("Đã sửa xong").completedAt(LocalDateTime.now()).build());

        // 17. Feedback
        feedbackRepository.save(Feedback.builder().user(residentUser).category(feedbackCategories.get(0)).content("Đề xuất tăng cường bảo vệ").submittedAt(LocalDateTime.now()).status(FeedbackStatus.PENDING).build());
        feedbackRepository.save(Feedback.builder().user(residentUser).category(feedbackCategories.get(2)).content("Khen ngợi dịch vụ vệ sinh").submittedAt(LocalDateTime.now()).status(FeedbackStatus.RESPONDED).response("Cảm ơn phản hồi").respondedAt(LocalDateTime.now()).build());

        // 18. Activity Logs
        activityLogRepository.save(ActivityLog.builder().user(residentUser).actionType("LOGIN").description("Đăng nhập").timestamp(LocalDateTime.now()).build());
        activityLogRepository.save(ActivityLog.builder().user(residentUser).actionType("PAYMENT").description("Thanh toán hóa đơn").timestamp(LocalDateTime.now()).build());

        // 19. AI QA History
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser).question("Làm sao đổi mật khẩu?").aiAnswer("Vào phần tài khoản để đổi mật khẩu.").askedAt(LocalDateTime.now()).responseTime(1200).feedback("HELPFUL").build());
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser).question("Làm sao đăng ký sự kiện?").aiAnswer("Chọn sự kiện và nhấn Đăng ký.").askedAt(LocalDateTime.now()).responseTime(900).feedback("NOT_HELPFUL").build());

        System.out.println("✅ Data seeding completed successfully!");
    }
} 