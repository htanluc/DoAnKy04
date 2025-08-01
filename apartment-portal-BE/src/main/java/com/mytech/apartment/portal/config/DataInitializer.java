package com.mytech.apartment.portal.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;

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
    @Autowired private VehicleRepository vehicleRepository;

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
        
        // Thêm 6 resident users mới
        users.add(userRepository.findByEmail("vuthiG@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident7").email("vuthiG@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234582").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("dovanH@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident8").email("dovanH@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234583").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("buithiI@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident9").email("buithiI@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234584").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("ngovanJ@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident10").email("ngovanJ@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234585").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("lythiK@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident11").email("lythiK@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234586").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        users.add(userRepository.findByEmail("hovanL@gmail.com")
            .orElseGet(() -> userRepository.save(User.builder().username("resident12").email("hovanL@gmail.com").passwordHash(passwordEncoder.encode("password")).phoneNumber("0901234587").status(UserStatus.ACTIVE).roles(Set.of(residentRole)).build())));
        
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

        // 3. Buildings - Chỉ tạo nếu chưa có buildings nào
        List<Building> buildings;
        if (buildingRepository.count() == 0) {
            buildings = new ArrayList<>();
            buildings.add(buildingRepository.save(Building.builder().buildingName("Tòa A").address("123 Đường ABC, Quận 1, TP.HCM").floors(20).description("Tòa nhà cao cấp với đầy đủ tiện ích").build()));
            buildings.add(buildingRepository.save(Building.builder().buildingName("Tòa B").address("456 Đường XYZ, Quận 2, TP.HCM").floors(15).description("Tòa nhà trung cấp phù hợp gia đình").build()));
            buildings.add(buildingRepository.save(Building.builder().buildingName("Tòa C").address("789 Đường DEF, Quận 3, TP.HCM").floors(25).description("Tòa nhà cao cấp view đẹp").build()));
        } else {
            buildings = buildingRepository.findAll();
        }
        Building buildingA = buildings.get(0);
        Building buildingB = buildings.get(1);
        Building buildingC = buildings.get(2);

        // 4. Apartments
        List<Apartment> apartments = new ArrayList<>();
        for (int i = 1; i <= 15; i++) {
            apartments.add(apartmentRepository.save(Apartment.builder().buildingId(buildingA.getId()).floorNumber((i + 1) / 2).unitNumber("A" + ((i + 1) / 2) + "-" + String.format("%02d", i)).area(75.0 + (i * 5.0)).status(i % 3 == 0 ? ApartmentStatus.VACANT : ApartmentStatus.OCCUPIED).build()));
        }
        for (int i = 1; i <= 15; i++) {
            apartments.add(apartmentRepository.save(Apartment.builder().buildingId(buildingB.getId()).floorNumber((i + 1) / 2).unitNumber("B" + ((i + 1) / 2) + "-" + String.format("%02d", i)).area(65.0 + (i * 5.0)).status(i % 4 == 0 ? ApartmentStatus.VACANT : ApartmentStatus.OCCUPIED).build()));
        }
        for (int i = 1; i <= 15; i++) {
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
        String[] names = {"Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E", "Đặng Thị F", 
                         "Vũ Thị G", "Đỗ Văn H", "Bùi Thị I", "Ngô Văn J", "Lý Thị K", "Hồ Văn L"};
        List<Resident> residents = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Resident resident = Resident.builder()
                .userId(users.get(4 + i).getId())
                .fullName(names[i])
                .dateOfBirth(LocalDate.of(1980 + i, (i % 12) + 1, (i % 28) + 1))
                .idCardNumber("123456789" + String.format("%03d", i + 12))
                .familyRelation(i < 6 ? "Chủ hộ" : "Thành viên")
                .status(1)
                .build();
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

        // 7. Facilities - Chỉ tạo nếu chưa có facilities nào
        List<Facility> facilities;
        if (facilityRepository.count() == 0) {
            facilities = new ArrayList<>();
            facilities.add(facilityRepository.save(Facility.builder().name("Phòng Gym").description("Phòng tập thể dục với đầy đủ thiết bị hiện đại").capacity(20).otherDetails("Mở cửa 6:00-22:00, có huấn luyện viên").usageFee(50000.0).openingHours("06:00 - 22:00").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Hồ bơi").description("Hồ bơi ngoài trời với view đẹp").capacity(50).otherDetails("Mở cửa 6:00-21:00, có cứu hộ").usageFee(100000.0).openingHours("06:00 - 21:00").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Phòng họp").description("Phòng họp đa năng cho cư dân").capacity(30).otherDetails("Có thể đặt trước, có máy chiếu").usageFee(30000.0).openingHours("08:00 - 20:00").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Sân tennis").description("Sân tennis ngoài trời chất lượng cao").capacity(8).otherDetails("Có đèn chiếu sáng, có thể chơi ban đêm").usageFee(80000.0).openingHours("06:00 - 22:00").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Khu BBQ").description("Khu vực nướng BBQ ngoài trời").capacity(40).otherDetails("Có bàn ghế, lò nướng").usageFee(50000.0).openingHours("16:00 - 22:00").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Phòng sinh hoạt cộng đồng").description("Phòng đa năng cho các hoạt động cộng đồng").capacity(100).otherDetails("Có sân khấu, âm thanh ánh sáng").usageFee(20000.0).openingHours("08:00 - 22:00").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Bãi đỗ xe").description("Bãi đỗ xe có mái che").capacity(200).otherDetails("Miễn phí cho cư dân").usageFee(10000.0).openingHours("24/7").build()));
            facilities.add(facilityRepository.save(Facility.builder().name("Khu vui chơi trẻ em").description("Sân chơi an toàn cho trẻ em").capacity(30).otherDetails("Có đồ chơi, có ghế ngồi cho phụ huynh").usageFee(30000.0).openingHours("06:00 - 20:00").build()));
        } else {
            facilities = facilityRepository.findAll();
        }

        // 8. Service Categories - Kiểm tra tồn tại trước khi tạo
        List<ServiceCategory> serviceCategories = new ArrayList<>();
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("ELECTRICITY")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("ELECTRICITY").categoryName("Điện").assignedRole("TECHNICIAN").description("Sửa chữa điện, thay bóng đèn, ổ cắm").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("PLUMBING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("PLUMBING").categoryName("Nước").assignedRole("TECHNICIAN").description("Sửa ống nước, vòi nước, bồn cầu").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("CLEANING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("CLEANING").categoryName("Vệ sinh").assignedRole("CLEANER").description("Dọn dẹp, lau chùi, vệ sinh chung").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("SECURITY")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("SECURITY").categoryName("An ninh").assignedRole("SECURITY").description("Tuần tra, kiểm tra an ninh, xử lý sự cố").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("HVAC")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("HVAC").categoryName("Điều hòa").assignedRole("TECHNICIAN").description("Bảo trì, sửa chữa điều hòa").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("ELEVATOR")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("ELEVATOR").categoryName("Thang máy").assignedRole("TECHNICIAN").description("Bảo trì, sửa chữa thang máy").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("GARDENING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("GARDENING").categoryName("Cây xanh").assignedRole("CLEANER").description("Chăm sóc cây xanh, cắt tỉa").build())));
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("GENERAL")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder().categoryCode("GENERAL").categoryName("Khác").assignedRole("STAFF").description("Các yêu cầu khác").build())));

        // 9. Feedback Categories - Kiểm tra tồn tại trước khi tạo
        List<FeedbackCategory> feedbackCategories = new ArrayList<>();
        feedbackCategories.add(feedbackCategoryRepository.findById("SUGGESTION")
            .orElseGet(() -> feedbackCategoryRepository.save(FeedbackCategory.builder().categoryCode("SUGGESTION").categoryName("Đề xuất").description("Đề xuất cải tiến").build())));
        feedbackCategories.add(feedbackCategoryRepository.findById("COMPLAINT")
            .orElseGet(() -> feedbackCategoryRepository.save(FeedbackCategory.builder().categoryCode("COMPLAINT").categoryName("Khiếu nại").description("Khiếu nại về dịch vụ").build())));
        feedbackCategories.add(feedbackCategoryRepository.findById("COMPLIMENT")
            .orElseGet(() -> feedbackCategoryRepository.save(FeedbackCategory.builder().categoryCode("COMPLIMENT").categoryName("Khen ngợi").description("Khen ngợi dịch vụ").build())));

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
        
        // Thêm thông báo mới
        announcementRepository.save(Announcement.builder()
            .title("Thông báo về dịch vụ vệ sinh")
            .content("Dịch vụ vệ sinh sẽ được thực hiện vào thứ 2 và thứ 6 hàng tuần. Vui lòng để rác đúng nơi quy định.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(admin.getId())
            .isActive(true)
            .createdAt(LocalDateTime.now().minusDays(2))
            .build());
        announcementRepository.save(Announcement.builder()
            .title("Thông báo về bảo mật")
            .content("Vui lòng đóng cửa cẩn thận và không cho người lạ vào tòa nhà. Báo cáo ngay nếu thấy hành vi đáng ngờ.")
            .type("URGENT")
            .targetAudience("ALL")
            .createdBy(admin.getId())
            .isActive(true)
            .createdAt(LocalDateTime.now().minusDays(1))
            .build());
        announcementRepository.save(Announcement.builder()
            .title("Thông báo về dịch vụ internet")
            .content("Dịch vụ internet sẽ được nâng cấp vào ngày 28/12/2024. Có thể bị gián đoạn từ 2:00-4:00 sáng.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(admin.getId())
            .isActive(true)
            .createdAt(LocalDateTime.now().minusDays(3))
            .build());

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
            .startTime(LocalDateTime.of(2025,12,15,19,0))
            .endTime(LocalDateTime.of(2025,12,15,21,0))
            .location("Phòng sinh hoạt cộng đồng")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Lớp yoga miễn phí")
            .description("Lớp yoga miễn phí cho cư dân mỗi sáng Chủ nhật")
            .startTime(LocalDateTime.of(2024,12,22,7,0))
            .endTime(LocalDateTime.of(2026,12,22,8,30))
            .location("Phòng gym")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Workshop nấu ăn")
            .description("Workshop nấu ăn truyền thống Việt Nam")
            .startTime(LocalDateTime.of(2024,12,28,14,0))
            .endTime(LocalDateTime.of(2026,12,28,17,0))
            .location("Khu BBQ")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Giải tennis cư dân")
            .description("Giải đấu tennis thường niên cho cư dân")
            .startTime(LocalDateTime.of(2025,12,29,8,0))
            .endTime(LocalDateTime.of(2026,12,29,18,0))
            .location("Sân tennis")
            .createdAt(LocalDateTime.now())
            .build()));
        
        // Thêm sự kiện mới
        events.add(eventRepository.save(Event.builder()
            .title("Lớp học nấu ăn")
            .description("Lớp học nấu ăn truyền thống Việt Nam cho cư dân")
            .startTime(LocalDateTime.of(2024,12,30,14,0))
            .endTime(LocalDateTime.of(2024,12,30,17,0))
            .location("Phòng sinh hoạt cộng đồng")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Họp cư dân tháng 1/2025")
            .description("Họp cư dân định kỳ để thảo luận các vấn đề chung")
            .startTime(LocalDateTime.of(2025,1,15,19,0))
            .endTime(LocalDateTime.of(2025,1,15,21,0))
            .location("Phòng sinh hoạt cộng đồng")
            .createdAt(LocalDateTime.now())
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Tiệc mừng năm mới")
            .description("Tiệc mừng năm mới 2026 cho cư dân")
            .startTime(LocalDateTime.of(2026,1,1,18,0))
            .endTime(LocalDateTime.of(2026,1,1,23,0))
            .location("Sảnh chính tòa A")
            .createdAt(LocalDateTime.now())
            .build()));

        // 12. Event Registrations
        // Sửa lỗi: Resident không có getId(), dùng getUserId()

        // Thêm event registrations mới
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(1)).residentId(residents.get(3).getUserId()).status(EventRegistrationStatus.REGISTERED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(1)).residentId(residents.get(4).getUserId()).status(EventRegistrationStatus.REGISTERED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(2)).residentId(residents.get(5).getUserId()).status(EventRegistrationStatus.REGISTERED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(3)).residentId(residents.get(6).getUserId()).status(EventRegistrationStatus.REGISTERED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(4)).residentId(residents.get(7).getUserId()).status(EventRegistrationStatus.REGISTERED).build());
        eventRegistrationRepository.save(EventRegistration.builder().event(events.get(5)).residentId(residents.get(8).getUserId()).status(EventRegistrationStatus.REGISTERED).build());

        // 13. Facility Bookings
        User residentUser = users.get(4);
        facilityBookingRepository.save(FacilityBooking.builder().facility(facilities.get(0)).user(residentUser).bookingTime(LocalDateTime.now().plusDays(1)).duration(60).status(FacilityBookingStatus.PENDING).createdAt(LocalDateTime.now()).numberOfPeople(2).build());
        facilityBookingRepository.save(FacilityBooking.builder().facility(facilities.get(0)).user(residentUser).bookingTime(LocalDateTime.now().plusDays(2)).duration(60).status(FacilityBookingStatus.REJECTED).createdAt(LocalDateTime.now()).numberOfPeople(4).build());
        // Sửa lỗi: approvedBy(User) không tồn tại, dùng approvedById nếu có, hoặc bỏ approvedBy
        facilityBookingRepository.save(FacilityBooking.builder().facility(facilities.get(1)).user(users.get(5)).bookingTime(LocalDateTime.now().plusDays(3)).duration(90).status(FacilityBookingStatus.CONFIRMED)
            //.approvedBy(admin) // Xóa dòng này nếu không có approvedBy
            .createdAt(LocalDateTime.now()).numberOfPeople(6).build());

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
        
        // Thêm facility bookings mới
        User residentUser6 = users.get(9);
        User residentUser7 = users.get(10);
        facilityBookingRepository.save(FacilityBooking.builder()
            .facility(facilities.get(4))
            .user(residentUser6)
            .bookingTime(LocalDateTime.now().plusDays(4))
            .duration(120)
            .status(FacilityBookingStatus.CONFIRMED)
            .createdAt(LocalDateTime.now())
            .numberOfPeople(8)
            .build());
        facilityBookingRepository.save(FacilityBooking.builder()
            .facility(facilities.get(5))
            .user(residentUser7)
            .bookingTime(LocalDateTime.now().plusDays(5))
            .duration(180)
            .status(FacilityBookingStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .numberOfPeople(15)
            .build());
        facilityBookingRepository.save(FacilityBooking.builder()
            .facility(facilities.get(6))
            .user(residentUser6)
            .bookingTime(LocalDateTime.now().plusDays(6))
            .duration(60)
            .status(FacilityBookingStatus.CONFIRMED)
            .createdAt(LocalDateTime.now())
            .numberOfPeople(2)
            .build());

        // 14. Invoices & Invoice Items
        for (Resident resident : residents) {
            // Sửa lỗi: findByUserId(Long) không tồn tại, dùng findByIdResidentId(Long)
            List<ApartmentResident> links = apartmentResidentRepository.findByIdResidentId(resident.getUserId());
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
        
        // Thêm service requests mới
        User residentUser2 = users.get(5);
        User residentUser3 = users.get(6);
        serviceRequestRepository.save(ServiceRequest.builder().user(residentUser2).category(serviceCategories.get(2)).description("Cần dọn dẹp khu vực chung").submittedAt(LocalDateTime.now().minusDays(1)).status(ServiceRequestStatus.IN_PROGRESS).priority(ServiceRequestPriority.P3).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(residentUser3).category(serviceCategories.get(3)).description("Báo cáo người lạ trong tòa nhà").submittedAt(LocalDateTime.now().minusDays(2)).status(ServiceRequestStatus.COMPLETED).priority(ServiceRequestPriority.P1).resolutionNotes("Đã kiểm tra và xử lý").completedAt(LocalDateTime.now().minusDays(1)).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(residentUser2).category(serviceCategories.get(4)).description("Điều hòa không hoạt động").submittedAt(LocalDateTime.now().minusDays(3)).status(ServiceRequestStatus.OPEN).priority(ServiceRequestPriority.P2).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(residentUser3).category(serviceCategories.get(5)).description("Thang máy bị kẹt").submittedAt(LocalDateTime.now().minusDays(4)).status(ServiceRequestStatus.COMPLETED).priority(ServiceRequestPriority.P1).resolutionNotes("Đã sửa chữa thang máy").completedAt(LocalDateTime.now().minusDays(3)).build());
        
        // Thêm service requests mới
        serviceRequestRepository.save(ServiceRequest.builder().user(users.get(7)).category(serviceCategories.get(6)).description("Cần cắt tỉa cây xanh").submittedAt(LocalDateTime.now().minusDays(5)).status(ServiceRequestStatus.OPEN).priority(ServiceRequestPriority.P3).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(users.get(8)).category(serviceCategories.get(7)).description("Yêu cầu thông tin về dịch vụ").submittedAt(LocalDateTime.now().minusDays(6)).status(ServiceRequestStatus.COMPLETED).priority(ServiceRequestPriority.P3).resolutionNotes("Đã cung cấp thông tin chi tiết").completedAt(LocalDateTime.now().minusDays(5)).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(users.get(9)).category(serviceCategories.get(0)).description("Cần sửa ổ cắm điện").submittedAt(LocalDateTime.now().minusDays(7)).status(ServiceRequestStatus.IN_PROGRESS).priority(ServiceRequestPriority.P2).build());
        serviceRequestRepository.save(ServiceRequest.builder().user(users.get(10)).category(serviceCategories.get(1)).description("Vòi nước bị rò rỉ").submittedAt(LocalDateTime.now().minusDays(8)).status(ServiceRequestStatus.COMPLETED).priority(ServiceRequestPriority.P1).resolutionNotes("Đã thay vòi nước mới").completedAt(LocalDateTime.now().minusDays(7)).build());

        // 17. Feedback
        feedbackRepository.save(Feedback.builder().user(residentUser).category(feedbackCategories.get(0)).content("Đề xuất tăng cường bảo vệ").submittedAt(LocalDateTime.now()).status(FeedbackStatus.PENDING).build());
        feedbackRepository.save(Feedback.builder().user(residentUser).category(feedbackCategories.get(2)).content("Khen ngợi dịch vụ vệ sinh").submittedAt(LocalDateTime.now()).status(FeedbackStatus.RESPONDED).response("Cảm ơn phản hồi").respondedAt(LocalDateTime.now()).build());
        
        // Thêm feedback mới
        User residentUser4 = users.get(7);
        User residentUser5 = users.get(8);
        feedbackRepository.save(Feedback.builder().user(residentUser2).category(feedbackCategories.get(1)).content("Khiếu nại về tiếng ồn từ căn hộ bên cạnh").submittedAt(LocalDateTime.now().minusDays(1)).status(FeedbackStatus.RESPONDED).response("Đã liên hệ với cư dân để giải quyết").respondedAt(LocalDateTime.now()).build());
        feedbackRepository.save(Feedback.builder().user(residentUser3).category(feedbackCategories.get(0)).content("Đề xuất lắp thêm camera an ninh").submittedAt(LocalDateTime.now().minusDays(2)).status(FeedbackStatus.PENDING).build());
        feedbackRepository.save(Feedback.builder().user(residentUser4).category(feedbackCategories.get(2)).content("Khen ngợi dịch vụ kỹ thuật nhanh chóng").submittedAt(LocalDateTime.now().minusDays(3)).status(FeedbackStatus.RESPONDED).response("Cảm ơn sự tin tưởng của bạn").respondedAt(LocalDateTime.now().minusDays(1)).build());
        feedbackRepository.save(Feedback.builder().user(residentUser5).category(feedbackCategories.get(1)).content("Khiếu nại về chất lượng nước").submittedAt(LocalDateTime.now().minusDays(4)).status(FeedbackStatus.PENDING).response("Đang kiểm tra và xử lý").respondedAt(LocalDateTime.now().minusDays(2)).build());

        // 18. Activity Logs
        activityLogRepository.save(ActivityLog.builder().user(residentUser).actionType("LOGIN").description("Đăng nhập").timestamp(LocalDateTime.now()).build());
        activityLogRepository.save(ActivityLog.builder().user(residentUser).actionType("PAYMENT").description("Thanh toán hóa đơn").timestamp(LocalDateTime.now()).build());
        
        // Thêm activity logs mới
        activityLogRepository.save(ActivityLog.builder().user(residentUser2).actionType("LOGIN").description("Đăng nhập").timestamp(LocalDateTime.now().minusHours(2)).build());
        activityLogRepository.save(ActivityLog.builder().user(residentUser2).actionType("FACILITY_BOOKING").description("Đặt phòng gym").timestamp(LocalDateTime.now().minusHours(1)).build());
        activityLogRepository.save(ActivityLog.builder().user(residentUser3).actionType("LOGIN").description("Đăng nhập").timestamp(LocalDateTime.now().minusHours(3)).build());
        activityLogRepository.save(ActivityLog.builder().user(residentUser3).actionType("SERVICE_REQUEST").description("Tạo yêu cầu sửa chữa").timestamp(LocalDateTime.now().minusHours(2)).build());
        activityLogRepository.save(ActivityLog.builder().user(adminUser).actionType("ANNOUNCEMENT_CREATE").description("Tạo thông báo mới").timestamp(LocalDateTime.now().minusHours(4)).build());
        activityLogRepository.save(ActivityLog.builder().user(adminUser).actionType("USER_MANAGEMENT").description("Quản lý người dùng").timestamp(LocalDateTime.now().minusHours(5)).build());

        // 19. AI QA History
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser).question("Làm sao đổi mật khẩu?").aiAnswer("Vào phần tài khoản để đổi mật khẩu.").askedAt(LocalDateTime.now()).responseTime(1200).feedback("HELPFUL").build());
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser).question("Làm sao đăng ký sự kiện?").aiAnswer("Chọn sự kiện và nhấn Đăng ký.").askedAt(LocalDateTime.now()).responseTime(900).feedback("NOT_HELPFUL").build());
        
        // Thêm AI QA history mới
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser2).question("Làm sao thanh toán hóa đơn?").aiAnswer("Vào phần hóa đơn và chọn phương thức thanh toán phù hợp.").askedAt(LocalDateTime.now().minusHours(1)).responseTime(800).feedback("HELPFUL").build());
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser3).question("Giờ mở cửa phòng gym?").aiAnswer("Phòng gym mở cửa từ 6:00-22:00 hàng ngày.").askedAt(LocalDateTime.now().minusHours(2)).responseTime(600).feedback("HELPFUL").build());
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser4).question("Làm sao báo cáo sự cố?").aiAnswer("Vào phần yêu cầu dịch vụ để tạo báo cáo sự cố.").askedAt(LocalDateTime.now().minusHours(3)).responseTime(1000).feedback("HELPFUL").build());
        aiQaHistoryRepository.save(AiQaHistory.builder().user(residentUser5).question("Phí dịch vụ bao nhiêu?").aiAnswer("Phí dịch vụ thay đổi theo loại dịch vụ, vui lòng xem chi tiết trong phần hóa đơn.").askedAt(LocalDateTime.now().minusHours(4)).responseTime(1500).feedback("NOT_HELPFUL").build());

        // 20. Vehicles (Cars) - Tạo ít nhất 1 xe cho mỗi resident
        String[] carBrands = {"Toyota", "Honda", "Ford", "Hyundai", "Mazda", "Kia", "Nissan", "Mitsubishi", "Suzuki", "Daihatsu", "Chevrolet", "BMW", "Mercedes", "Audi"};
        String[] carModels = {"Vios", "City", "Ranger", "Accent", "CX-5", "Cerato", "Sunny", "Lancer", "Swift", "Terios", "Spark", "X3", "C-Class", "A4"};
        String[] carColors = {"Trắng", "Đen", "Bạc", "Xanh", "Đỏ", "Vàng", "Xám", "Nâu"};
        String[] carImageUrls = {
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop"
        };
        
        for (int i = 0; i < residents.size(); i++) {
            Resident resident = residents.get(i);
            String licensePlate = "30A-" + String.format("%05d", 10000 + i);
            String brand = carBrands[i % carBrands.length];
            String model = carModels[i % carModels.length];
            String color = carColors[i % carColors.length];
            String imageUrl = carImageUrls[i % carImageUrls.length];
            
            // Tạo mảng JSON cho imageUrls
            String imageUrlsArray = "[\"" + imageUrl + "\"]";
            
            vehicleRepository.save(Vehicle.builder()
                .licensePlate(licensePlate)
                .vehicleType(VehicleType.CAR)
                .brand(brand)
                .model(model)
                .color(color)
                .imageUrls(imageUrlsArray)
                .status(VehicleStatus.APPROVED)
                .monthlyFee(new BigDecimal("150000"))
                .resident(resident)
                .build());
        }

        // 21. Additional Service Requests - Tạo thêm yêu cầu dịch vụ với các trạng thái khác nhau cho mỗi resident
        ServiceRequestStatus[] statuses = {ServiceRequestStatus.OPEN, ServiceRequestStatus.IN_PROGRESS, ServiceRequestStatus.COMPLETED, ServiceRequestStatus.CANCELLED};
        ServiceRequestPriority[] priorities = {ServiceRequestPriority.P1, ServiceRequestPriority.P2, ServiceRequestPriority.P3};
        String[] descriptions = {
            "Cần sửa chữa điều hòa không lạnh",
            "Báo cáo tiếng ồn từ căn hộ bên cạnh", 
            "Yêu cầu thay thế bóng đèn hành lang",
            "Cần dọn dẹp khu vực chung",
            "Báo cáo người lạ trong tòa nhà",
            "Cần sửa chữa thang máy",
            "Yêu cầu cắt tỉa cây xanh",
            "Báo cáo rò rỉ nước",
            "Cần sửa chữa cửa ra vào",
            "Yêu cầu thông tin về dịch vụ",
            "Báo cáo mất điện",
            "Cần sửa chữa hệ thống nước",
            "Yêu cầu vệ sinh căn hộ",
            "Báo cáo sự cố an ninh"
        };
        
        for (int i = 0; i < residents.size(); i++) {
            Resident resident = residents.get(i);
            User currentResidentUser = users.get(4 + i); // resident users start from index 4
            
            // Tạo 5 service requests cho mỗi resident với các trạng thái khác nhau
            for (int j = 0; j < 5; j++) {
                ServiceRequestStatus status = statuses[j % statuses.length];
                ServiceRequestPriority priority = priorities[j % priorities.length];
                String description = descriptions[(i * 5 + j) % descriptions.length];
                
                ServiceRequest serviceRequest = ServiceRequest.builder()
                    .user(currentResidentUser)
                    .category(serviceCategories.get(j % serviceCategories.size()))
                    .description(description)
                    .submittedAt(LocalDateTime.now().minusDays(j + 1))
                    .status(status)
                    .priority(priority)
                    .build();
                
                // Thêm resolution notes và completedAt cho các request đã hoàn thành
                if (status == ServiceRequestStatus.COMPLETED) {
                    serviceRequest.setResolutionNotes("Đã xử lý xong yêu cầu");
                    serviceRequest.setCompletedAt(LocalDateTime.now().minusDays(j));
                }
                
                serviceRequestRepository.save(serviceRequest);
            }
        }

        // 22. Additional Event Registrations - Đăng ký thêm sự kiện cho mỗi resident
        for (int i = 0; i < residents.size(); i++) {
            Resident resident = residents.get(i);
            
            // Đăng ký cho 6 sự kiện khác nhau với các trạng thái khác nhau
            EventRegistrationStatus[] regStatuses = {EventRegistrationStatus.REGISTERED, EventRegistrationStatus.CANCELLED};
            
            for (int j = 0; j < 6 && j < events.size(); j++) {
                EventRegistrationStatus status = regStatuses[j % regStatuses.length];
                
                eventRegistrationRepository.save(EventRegistration.builder()
                    .event(events.get(j))
                    .residentId(resident.getUserId())
                    .status(status)
                    .build());
            }
        }

        // 23. Cleanup duplicate event registrations (after ALL event registrations are created)
        System.out.println("🧹 Cleaning up duplicate event registrations...");
        cleanupDuplicateEventRegistrations();
        
        System.out.println("✅ Data seeding completed successfully!");

    }

    /**
     * Cleanup duplicate event registrations
     * Removes duplicate registrations for the same event-resident pair
     * Keeps only the most recent REGISTERED one, or the most recent one if no REGISTERED exists
     */
    private void cleanupDuplicateEventRegistrations() {
        try {
            System.out.println("🔍 Starting duplicate event registration cleanup...");
            
            // Get all event registrations
            List<EventRegistration> allRegistrations = eventRegistrationRepository.findAll();
            System.out.println("📊 Total event registrations found: " + allRegistrations.size());
            
            // Group by event_id and resident_id
            Map<String, List<EventRegistration>> groupedRegistrations = allRegistrations.stream()
                .collect(Collectors.groupingBy(reg -> reg.getEvent().getId() + "-" + reg.getResidentId()));
            
            System.out.println("📋 Unique event-resident combinations: " + groupedRegistrations.size());
            
            int totalDeleted = 0;
            int duplicatesFound = 0;
            
            for (Map.Entry<String, List<EventRegistration>> entry : groupedRegistrations.entrySet()) {
                List<EventRegistration> registrations = entry.getValue();
                
                // If there's only one registration, skip
                if (registrations.size() <= 1) {
                    continue;
                }
                
                duplicatesFound++;
                System.out.println("⚠️  Found " + registrations.size() + " registrations for " + entry.getKey());
                
                // Find the registration to keep
                EventRegistration registrationToKeep = null;
                
                // First, try to find the most recent REGISTERED one
                List<EventRegistration> registeredOnes = registrations.stream()
                    .filter(reg -> reg.getStatus() == EventRegistrationStatus.REGISTERED)
                    .collect(Collectors.toList());
                
                if (!registeredOnes.isEmpty()) {
                    // Keep the most recent REGISTERED one
                    registrationToKeep = registeredOnes.stream()
                        .max(Comparator.comparing(EventRegistration::getRegisteredAt))
                        .orElse(registeredOnes.get(0));
                    System.out.println("✅ Keeping REGISTERED registration ID: " + registrationToKeep.getId());
                } else {
                    // If no REGISTERED ones, keep the most recent one
                    registrationToKeep = registrations.stream()
                        .max(Comparator.comparing(EventRegistration::getRegisteredAt))
                        .orElse(registrations.get(0));
                    System.out.println("✅ Keeping most recent registration ID: " + registrationToKeep.getId());
                }
                
                // Delete all other registrations
                for (EventRegistration reg : registrations) {
                    if (!reg.getId().equals(registrationToKeep.getId())) {
                        eventRegistrationRepository.delete(reg);
                        totalDeleted++;
                        System.out.println("🗑️  Deleted registration ID: " + reg.getId() + " (status: " + reg.getStatus() + ")");
                    }
                }
            }
            
            System.out.println("📈 Summary:");
            System.out.println("   - Duplicate groups found: " + duplicatesFound);
            System.out.println("   - Total registrations deleted: " + totalDeleted);
            System.out.println("✅ Cleanup completed successfully!");
            
        } catch (Exception e) {
            System.err.println("❌ Error during cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 