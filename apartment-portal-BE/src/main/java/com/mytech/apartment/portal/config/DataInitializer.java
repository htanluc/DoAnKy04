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
import org.springframework.transaction.annotation.Transactional;

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
    // @Autowired private PaymentMethodRepository paymentMethodRepository; // Comment out if not exists
    // @Autowired private EmergencyContactRepository emergencyContactRepository; // Comment out if not exists
    // @Autowired private ApartmentInvitationRepository apartmentInvitationRepository; // Comment out if not exists
    // @Autowired private ServiceFeeConfigRepository serviceFeeConfigRepository; // Comment out if not exists

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Starting comprehensive data initialization...");
        
        // PART 1: ROLES & USERS (Enhanced with more realistic data)
        initializeRolesAndUsers();
        
        // PART 2: BUILDINGS & APARTMENTS
        initializeBuildingsAndApartments();
        
        // PART 3: APARTMENT RESIDENTS (Many-to-many relationships)
        initializeApartmentResidents();
        
        // PART 4: FACILITIES & SERVICE CATEGORIES
        initializeFacilitiesAndServiceCategories();
        
        // PART 5: ANNOUNCEMENTS & EVENTS
        initializeAnnouncementsAndEvents();
        
        // PART 6: FACILITY BOOKINGS
        initializeFacilityBookings();
        
        // PART 7: INVOICES & PAYMENTS
        initializeInvoicesAndPayments();
        
        // PART 8: SERVICE REQUESTS & FEEDBACK
        initializeServiceRequestsAndFeedback();
        
        // PART 9: ACTIVITY LOGS & AI QA
        initializeActivityLogsAndAiQa();
        
        // PART 10: VEHICLES
        initializeVehicles();
        
        // PART 11: EMERGENCY CONTACTS & ADDITIONAL DATA
        initializeEmergencyContactsAndAdditionalData();
        
        System.out.println("✅ Comprehensive data initialization completed successfully!");
    }

    /**
     * PART 1: Initialize Roles and Users with enhanced data
     */
    private void initializeRolesAndUsers() {
        System.out.println("👥 Initializing Roles and Users...");
        
        // 1.1 Create Roles
        Role adminRole = roleRepository.save(Role.builder()
            .name("ADMIN")
            .description("Quản trị viên hệ thống - Toàn quyền truy cập và quản lý")
            .build());
        
        Role staffRole = roleRepository.save(Role.builder()
            .name("STAFF")
            .description("Nhân viên quản lý - Quản lý căn hộ, dịch vụ và cư dân")
            .build());
        
        Role residentRole = roleRepository.save(Role.builder()
            .name("RESIDENT")
            .description("Cư dân - Sử dụng dịch vụ, thanh toán và báo cáo sự cố")
            .build());
        
        Role technicianRole = roleRepository.save(Role.builder()
            .name("TECHNICIAN")
            .description("Kỹ thuật viên - Xử lý sự cố kỹ thuật và bảo trì")
            .build());
        
        Role cleanerRole = roleRepository.save(Role.builder()
            .name("CLEANER")
            .description("Nhân viên vệ sinh - Dọn dẹp và bảo trì vệ sinh")
            .build());
        
        Role securityRole = roleRepository.save(Role.builder()
            .name("SECURITY")
            .description("Bảo vệ - An ninh, tuần tra và kiểm soát ra vào")
            .build());

        // 1.2 Create Enhanced Users with complete information
        List<User> users = new ArrayList<>();
        
        // Admin Users
        users.add(createUser("admin", "admin@apartment.com", "0901234567", "Nguyễn Văn Admin", 
            LocalDate.of(1985, 5, 15), "123456789001", Set.of(adminRole), UserStatus.ACTIVE));
        
        users.add(createUser("manager", "manager@apartment.com", "0901234568", "Trần Thị Manager", 
            LocalDate.of(1988, 8, 20), "123456789002", Set.of(adminRole), UserStatus.ACTIVE));
        
        // Staff Users
        users.add(createUser("staff1", "staff1@apartment.com", "0901234569", "Lê Văn Staff", 
            LocalDate.of(1990, 3, 10), "123456789003", Set.of(staffRole), UserStatus.ACTIVE));
        
        users.add(createUser("staff2", "staff2@apartment.com", "0901234570", "Phạm Thị Staff", 
            LocalDate.of(1992, 7, 25), "123456789004", Set.of(staffRole), UserStatus.ACTIVE));
        
        // Resident Users with diverse information
        users.add(createUser("resident1", "nguyenvanA@gmail.com", "0901234571", "Nguyễn Văn An", 
            LocalDate.of(1980, 1, 15), "123456789005", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident2", "tranthiB@gmail.com", "0901234572", "Trần Thị Bình", 
            LocalDate.of(1982, 4, 22), "123456789006", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident3", "levanC@gmail.com", "0901234573", "Lê Văn Cường", 
            LocalDate.of(1985, 9, 8), "123456789007", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident4", "phamthiD@gmail.com", "0901234574", "Phạm Thị Dung", 
            LocalDate.of(1987, 12, 3), "123456789008", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident5", "hoangvanE@gmail.com", "0901234575", "Hoàng Văn Em", 
            LocalDate.of(1983, 6, 18), "123456789009", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident6", "dangthiF@gmail.com", "0901234576", "Đặng Thị Phương", 
            LocalDate.of(1989, 11, 12), "123456789010", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident7", "vuthiG@gmail.com", "0901234582", "Vũ Thị Giang", 
            LocalDate.of(1986, 2, 28), "123456789011", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident8", "dovanH@gmail.com", "0901234583", "Đỗ Văn Hùng", 
            LocalDate.of(1984, 8, 14), "123456789012", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident9", "buithiI@gmail.com", "0901234584", "Bùi Thị Inh", 
            LocalDate.of(1991, 5, 7), "123456789013", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident10", "ngovanJ@gmail.com", "0901234585", "Ngô Văn Jinh", 
            LocalDate.of(1981, 10, 30), "123456789014", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident11", "lythiK@gmail.com", "0901234586", "Lý Thị Kim", 
            LocalDate.of(1988, 3, 25), "123456789015", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident12", "hovanL@gmail.com", "0901234587", "Hồ Văn Long", 
            LocalDate.of(1983, 7, 19), "123456789016", Set.of(residentRole), UserStatus.ACTIVE));
        
        // Technician Users
        users.add(createUser("technician1", "technician1@apartment.com", "0901234577", "Nguyễn Văn Kỹ Thuật", 
            LocalDate.of(1985, 4, 5), "123456789017", Set.of(technicianRole), UserStatus.ACTIVE));
        
        users.add(createUser("technician2", "technician2@apartment.com", "0901234578", "Trần Thị Kỹ Thuật", 
            LocalDate.of(1987, 9, 12), "123456789018", Set.of(technicianRole), UserStatus.ACTIVE));
        
        // Cleaner Users
        users.add(createUser("cleaner1", "cleaner1@apartment.com", "0901234579", "Lê Văn Vệ Sinh", 
            LocalDate.of(1989, 1, 20), "123456789019", Set.of(cleanerRole), UserStatus.ACTIVE));
        
        users.add(createUser("cleaner2", "cleaner2@apartment.com", "0901234580", "Phạm Thị Vệ Sinh", 
            LocalDate.of(1990, 6, 8), "123456789020", Set.of(cleanerRole), UserStatus.ACTIVE));
        
        // Security Users
        users.add(createUser("security1", "security1@apartment.com", "0901234581", "Hoàng Văn Bảo Vệ", 
            LocalDate.of(1986, 12, 15), "123456789021", Set.of(securityRole), UserStatus.ACTIVE));
        
        users.add(createUser("security2", "security2@apartment.com", "0901234588", "Đặng Thị Bảo Vệ", 
            LocalDate.of(1988, 3, 22), "123456789022", Set.of(securityRole), UserStatus.ACTIVE));
        
        // Special Status Users
        users.add(createUser("resident_locked", "locked@gmail.com", "0901234589", "Nguyễn Văn Locked", 
            LocalDate.of(1990, 1, 1), "999999999999", Set.of(residentRole), UserStatus.LOCKED, "Vi phạm quy định"));
        
        users.add(createUser("resident_inactive", "inactive@gmail.com", "0901234590", "Trần Thị Inactive", 
            LocalDate.of(1991, 2, 2), "888888888888", Set.of(residentRole), UserStatus.INACTIVE));
        
        System.out.println("✅ Created " + users.size() + " users with complete information");
    }

    /**
     * Helper method to create users with complete information
     */
    private User createUser(String username, String email, String phoneNumber, String fullName, 
                           LocalDate dateOfBirth, String idCardNumber, Set<Role> roles, UserStatus status) {
        return createUser(username, email, phoneNumber, fullName, dateOfBirth, idCardNumber, roles, status, null);
    }
    
    private User createUser(String username, String email, String phoneNumber, String fullName, 
                           LocalDate dateOfBirth, String idCardNumber, Set<Role> roles, UserStatus status, String lockReason) {
        // Check if user exists by email or phone number
        Optional<User> existingUser = userRepository.findByEmail(email)
            .or(() -> userRepository.findByPhoneNumber(phoneNumber));
        
        return existingUser.orElseGet(() -> userRepository.save(User.builder()
            .username(username)
            .email(email)
            .passwordHash(passwordEncoder.encode("password"))
            .phoneNumber(phoneNumber)
            .fullName(fullName)
            .dateOfBirth(dateOfBirth)
            .idCardNumber(idCardNumber)
            .status(status)
            .lockReason(lockReason)
            .avatarUrl(null) // Will be set later if needed
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .roles(roles)
            .build()));
    }

    /**
     * PART 2: Initialize Buildings and Apartments with enhanced data
     */
    private void initializeBuildingsAndApartments() {
        System.out.println("🏢 Initializing Buildings and Apartments...");
        
        // 2.1 Create Enhanced Buildings
        List<Building> buildings = new ArrayList<>();
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tòa A - Golden Tower")
            .address("123 Đường ABC, Phường 1, Quận 1, TP.HCM")
            .floors(25)
            .description("Tòa nhà cao cấp với đầy đủ tiện ích, view đẹp hướng sông Sài Gòn")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tòa B - Silver Residence")
            .address("456 Đường XYZ, Phường 2, Quận 2, TP.HCM")
            .floors(20)
            .description("Tòa nhà trung cấp phù hợp gia đình, gần trường học và bệnh viện")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tòa C - Diamond Complex")
            .address("789 Đường DEF, Phường 3, Quận 3, TP.HCM")
            .floors(30)
            .description("Tòa nhà cao cấp view đẹp, tiện ích đầy đủ, an ninh 24/7")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tòa D - Emerald Garden")
            .address("321 Đường GHI, Phường 4, Quận 7, TP.HCM")
            .floors(18)
            .description("Tòa nhà với không gian xanh, phù hợp gia đình có trẻ em")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tòa E - Platinum Heights")
            .address("654 Đường JKL, Phường 5, Quận 4, TP.HCM")
            .floors(22)
            .description("Tòa nhà cao cấp với view biển, tiện ích sang trọng")
            .build()));

        // 2.2 Create Diverse Apartments for each building
        List<Apartment> apartments = new ArrayList<>();
        
        // Building A - Golden Tower (25 floors)
        for (int floor = 1; floor <= 25; floor++) {
            for (int unit = 1; unit <= 4; unit++) {
                String unitNumber = "A" + String.format("%02d", floor) + "-" + String.format("%02d", unit);
                double area = 75.0 + (unit * 10.0) + (floor * 2.0); // Vary by unit and floor
                ApartmentStatus status = (floor <= 20 && unit <= 3) ? ApartmentStatus.OCCUPIED : ApartmentStatus.VACANT;
                
                apartments.add(apartmentRepository.save(Apartment.builder()
                    .buildingId(buildings.get(0).getId())
                    .floorNumber(floor)
                    .unitNumber(unitNumber)
                    .area(area)
                    .status(status)
                    .build()));
            }
        }
        
        // Building B - Silver Residence (20 floors)
        for (int floor = 1; floor <= 20; floor++) {
            for (int unit = 1; unit <= 6; unit++) {
                String unitNumber = "B" + String.format("%02d", floor) + "-" + String.format("%02d", unit);
                double area = 65.0 + (unit * 8.0) + (floor * 1.5);
                ApartmentStatus status = (floor <= 15 && unit <= 4) ? ApartmentStatus.OCCUPIED : ApartmentStatus.VACANT;
                
                apartments.add(apartmentRepository.save(Apartment.builder()
                    .buildingId(buildings.get(1).getId())
                    .floorNumber(floor)
                    .unitNumber(unitNumber)
                    .area(area)
                    .status(status)
                    .build()));
            }
        }
        
        // Building C - Diamond Complex (30 floors)
        for (int floor = 1; floor <= 30; floor++) {
            for (int unit = 1; unit <= 3; unit++) {
                String unitNumber = "C" + String.format("%02d", floor) + "-" + String.format("%02d", unit);
                double area = 90.0 + (unit * 15.0) + (floor * 3.0);
                ApartmentStatus status = (floor <= 25 && unit <= 2) ? ApartmentStatus.OCCUPIED : ApartmentStatus.VACANT;
                
                apartments.add(apartmentRepository.save(Apartment.builder()
                    .buildingId(buildings.get(2).getId())
                    .floorNumber(floor)
                    .unitNumber(unitNumber)
                    .area(area)
                    .status(status)
                    .build()));
            }
        }
        
        // Building D - Emerald Garden (18 floors)
        for (int floor = 1; floor <= 18; floor++) {
            for (int unit = 1; unit <= 5; unit++) {
                String unitNumber = "D" + String.format("%02d", floor) + "-" + String.format("%02d", unit);
                double area = 70.0 + (unit * 12.0) + (floor * 2.5);
                ApartmentStatus status = (floor <= 12 && unit <= 3) ? ApartmentStatus.OCCUPIED : ApartmentStatus.VACANT;
                
                apartments.add(apartmentRepository.save(Apartment.builder()
                    .buildingId(buildings.get(3).getId())
                    .floorNumber(floor)
                    .unitNumber(unitNumber)
                    .area(area)
                    .status(status)
                    .build()));
            }
        }
        
        // Building E - Platinum Heights (22 floors)
        for (int floor = 1; floor <= 22; floor++) {
            for (int unit = 1; unit <= 4; unit++) {
                String unitNumber = "E" + String.format("%02d", floor) + "-" + String.format("%02d", unit);
                double area = 85.0 + (unit * 13.0) + (floor * 2.8);
                ApartmentStatus status = (floor <= 18 && unit <= 3) ? ApartmentStatus.OCCUPIED : ApartmentStatus.VACANT;
                
                apartments.add(apartmentRepository.save(Apartment.builder()
                    .buildingId(buildings.get(4).getId())
                    .floorNumber(floor)
                    .unitNumber(unitNumber)
                    .area(area)
                    .status(status)
                    .build()));
            }
        }
        
        System.out.println("✅ Created " + buildings.size() + " buildings and " + apartments.size() + " apartments");
    }

    /**
     * PART 3: Initialize Apartment Residents with many-to-many relationships
     */
    @Transactional
    private void initializeApartmentResidents() {
        System.out.println("🏠 Initializing Apartment Residents...");
        
        // Get all users with roles using JOIN FETCH
        List<User> allUsers = userRepository.findAllWithRoles();
        Role residentRole = roleRepository.findByName("RESIDENT");
        
        if (residentRole == null) {
            System.out.println("⚠️ RESIDENT role not found, skipping apartment residents initialization");
            return;
        }
        
        // Get all apartments
        List<Apartment> allApartments = apartmentRepository.findAll();
        
        // Get resident users only
        List<User> residentUsers = allUsers.stream()
            .filter(user -> user.getRoles() != null && user.getRoles().contains(residentRole))
            .collect(Collectors.toList());
        
        // Get occupied apartments only
        List<Apartment> occupiedApartments = allApartments.stream()
            .filter(apt -> apt.getStatus() == ApartmentStatus.OCCUPIED)
            .collect(Collectors.toList());
        
        System.out.println("📊 Found " + residentUsers.size() + " resident users and " + occupiedApartments.size() + " occupied apartments");
        
        // Create diverse apartment-resident relationships
        int relationshipCount = 0;
        
        // 3.1 Primary Residents (One primary resident per apartment)
        for (int i = 0; i < Math.min(residentUsers.size(), occupiedApartments.size()); i++) {
            User resident = residentUsers.get(i);
            Apartment apartment = occupiedApartments.get(i);
            
            // Create primary resident relationship
            ApartmentResident primaryResident = ApartmentResident.builder()
                .id(new ApartmentResidentId(apartment.getId(), resident.getId()))
                .apartment(apartment)
                .user(resident)
                .moveInDate(LocalDate.now().minusMonths(6 + (i % 12))) // Vary move-in dates
                .relationType(RelationType.OWNER)
                .isPrimaryResident(true)
                .build();
            
            apartmentResidentRepository.save(primaryResident);
            relationshipCount++;
            
            // 3.2 Add secondary residents (family members, tenants) for some apartments
            if (i % 3 == 0 && i + 1 < residentUsers.size()) {
                User secondaryResident = residentUsers.get((i + 1) % residentUsers.size());
                
                // Family member
                ApartmentResident familyMember = ApartmentResident.builder()
                    .id(new ApartmentResidentId(apartment.getId(), secondaryResident.getId()))
                    .apartment(apartment)
                    .user(secondaryResident)
                    .moveInDate(LocalDate.now().minusMonths(2))
                    .relationType(RelationType.FAMILY_MEMBER)
                    .isPrimaryResident(false)
                    .build();
                
                apartmentResidentRepository.save(familyMember);
                relationshipCount++;
            }
            
            // 3.3 Add tenants for some apartments (co-owners)
            if (i % 4 == 0 && i + 2 < residentUsers.size()) {
                User tenant = residentUsers.get((i + 2) % residentUsers.size());
                
                ApartmentResident tenantResident = ApartmentResident.builder()
                    .id(new ApartmentResidentId(apartment.getId(), tenant.getId()))
                    .apartment(apartment)
                    .user(tenant)
                    .moveInDate(LocalDate.now().minusMonths(3))
                    .relationType(RelationType.TENANT)
                    .isPrimaryResident(false)
                    .build();
                
                apartmentResidentRepository.save(tenantResident);
                relationshipCount++;
            }
        }
        
        // 3.4 Create additional relationships for some residents (multiple apartments)
        for (int i = 0; i < residentUsers.size() / 3; i++) {
            User resident = residentUsers.get(i);
            
            // Find available apartments for this resident
            List<Apartment> availableApartments = occupiedApartments.stream()
                .filter(apt -> !apartmentResidentRepository.findByApartment_Id(apt.getId()).stream()
                    .anyMatch(ar -> ar.getUser().getId().equals(resident.getId())))
                .collect(Collectors.toList());
            
            if (!availableApartments.isEmpty()) {
                Apartment secondApartment = availableApartments.get(0);
                
                ApartmentResident secondResidence = ApartmentResident.builder()
                    .id(new ApartmentResidentId(secondApartment.getId(), resident.getId()))
                    .apartment(secondApartment)
                    .user(resident)
                    .moveInDate(LocalDate.now().minusMonths(1))
                    .relationType(RelationType.TENANT)
                    .isPrimaryResident(false)
                    .build();
                
                apartmentResidentRepository.save(secondResidence);
                relationshipCount++;
            }
        }
        
        System.out.println("✅ Created " + relationshipCount + " apartment-resident relationships");
    }

    /**
     * PART 4: Initialize Facilities and Service Categories
     */
    private void initializeFacilitiesAndServiceCategories() {
        System.out.println("🏋️ Initializing Facilities and Service Categories...");
        
        // 4.1 Create Enhanced Facilities
        List<Facility> facilities = new ArrayList<>();
        
        // Sports & Fitness Facilities
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Phòng Gym Premium")
            .description("Phòng tập thể dục với đầy đủ thiết bị hiện đại, có huấn luyện viên cá nhân")
            .location("Tầng 1 - Tòa A")
            .capacity(30)
            .otherDetails("Mở cửa 6:00-22:00, có phòng thay đồ, tủ khóa, vòi sen")
            .usageFee(80000.0)
            .openingHours("06:00 - 22:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Hồ bơi Olympic")
            .description("Hồ bơi ngoài trời với view đẹp, có cứu hộ chuyên nghiệp")
            .location("Khu vực ngoài trời - Tầng trệt")
            .capacity(50)
            .otherDetails("Mở cửa 6:00-21:00, có ghế tắm nắng, quán bar bên hồ")
            .usageFee(120000.0)
            .openingHours("06:00 - 21:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Sân tennis chuyên nghiệp")
            .description("Sân tennis ngoài trời chất lượng cao với đèn chiếu sáng")
            .location("Khu vực ngoài trời - Tầng trệt")
            .capacity(8)
            .otherDetails("Có đèn chiếu sáng, có thể chơi ban đêm, có máy bán nước")
            .usageFee(100000.0)
            .openingHours("06:00 - 22:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Sân bóng rổ")
            .description("Sân bóng rổ ngoài trời với đèn chiếu sáng")
            .location("Khu vực ngoài trời - Tầng trệt")
            .capacity(20)
            .otherDetails("Có đèn chiếu sáng, có mái che, phù hợp cho trẻ em và người lớn")
            .usageFee(60000.0)
            .openingHours("06:00 - 22:00")
            .build()));
        
        // Community & Entertainment Facilities
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Phòng sinh hoạt cộng đồng")
            .description("Phòng đa năng cho các hoạt động cộng đồng, tiệc tùng")
            .location("Tầng 1 - Tòa C")
            .capacity(100)
            .otherDetails("Có sân khấu, âm thanh ánh sáng, bàn ghế, nhà bếp")
            .usageFee(30000.0)
            .openingHours("08:00 - 22:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Phòng họp đa năng")
            .description("Phòng họp đa năng cho cư dân, có máy chiếu và âm thanh")
            .location("Tầng 2 - Tòa B")
            .capacity(40)
            .otherDetails("Có máy chiếu, âm thanh, bàn ghế, wifi miễn phí")
            .usageFee(50000.0)
            .openingHours("08:00 - 20:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Khu BBQ ngoài trời")
            .description("Khu vực nướng BBQ ngoài trời với view đẹp")
            .location("Khu vực ngoài trời - Tầng trệt")
            .capacity(50)
            .otherDetails("Có bàn ghế, lò nướng, bếp gas, quán bar")
            .usageFee(80000.0)
            .openingHours("16:00 - 22:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Khu vui chơi trẻ em")
            .description("Sân chơi an toàn cho trẻ em với nhiều trò chơi")
            .location("Khu vực ngoài trời - Tầng trệt")
            .capacity(30)
            .otherDetails("Có đồ chơi, có ghế ngồi cho phụ huynh, có mái che")
            .usageFee(40000.0)
            .openingHours("06:00 - 20:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Spa & Massage")
            .description("Spa và massage thư giãn cho cư dân")
            .location("Tầng 1 - Tòa B")
            .capacity(10)
            .otherDetails("Có phòng massage, spa, sauna, có nhân viên chuyên nghiệp")
            .usageFee(200000.0)
            .openingHours("09:00 - 21:00")
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Bãi đỗ xe có mái che")
            .description("Bãi đỗ xe có mái che, an toàn cho xe cư dân")
            .location("Tầng hầm - Tòa A")
            .capacity(200)
            .otherDetails("Miễn phí cho cư dân, có camera giám sát, có bảo vệ")
            .usageFee(10000.0)
            .openingHours("24/7")
            .build()));
        
        // 4.2 Create Service Categories (only if they don't exist)
        List<ServiceCategory> serviceCategories = new ArrayList<>();
        
        // Create service categories only if they don't exist
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("ELECTRICITY")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("ELECTRICITY")
                .categoryName("Điện")
                .assignedRole("TECHNICIAN")
                .description("Sửa chữa điện, thay bóng đèn, ổ cắm, công tắc, tủ điện")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("PLUMBING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("PLUMBING")
                .categoryName("Nước")
                .assignedRole("TECHNICIAN")
                .description("Sửa ống nước, vòi nước, bồn cầu, bồn rửa, máy bơm nước")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("CLEANING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("CLEANING")
                .categoryName("Vệ sinh")
                .assignedRole("CLEANER")
                .description("Dọn dẹp, lau chùi, vệ sinh chung, thu gom rác")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("SECURITY")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("SECURITY")
                .categoryName("An ninh")
                .assignedRole("SECURITY")
                .description("Tuần tra, kiểm tra an ninh, xử lý sự cố, quản lý ra vào")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("HVAC")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("HVAC")
                .categoryName("Điều hòa")
                .assignedRole("TECHNICIAN")
                .description("Bảo trì, sửa chữa điều hòa, thông gió, lọc không khí")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("ELEVATOR")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("ELEVATOR")
                .categoryName("Thang máy")
                .assignedRole("TECHNICIAN")
                .description("Bảo trì, sửa chữa thang máy, kiểm tra an toàn")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("GARDENING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("GARDENING")
                .categoryName("Cây xanh")
                .assignedRole("CLEANER")
                .description("Chăm sóc cây xanh, cắt tỉa, tưới nước, bón phân")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("INTERNET")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("INTERNET")
                .categoryName("Internet & IT")
                .assignedRole("TECHNICIAN")
                .description("Sửa chữa mạng internet, wifi, camera, hệ thống IT")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("GENERAL")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("GENERAL")
                .categoryName("Khác")
                .assignedRole("STAFF")
                .description("Các yêu cầu khác không thuộc danh mục trên")
                .build())));
        
        System.out.println("✅ Created " + facilities.size() + " facilities and " + serviceCategories.size() + " service categories");
    }

    /**
     * PART 5: Initialize Announcements and Events
     */
    private void initializeAnnouncementsAndEvents() {
        System.out.println("📢 Initializing Announcements and Events...");
        
        // Get admin user for creating announcements
        User adminUser = userRepository.findByUsername("admin")
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
        
        // 5.1 Create Diverse Announcements
        List<Announcement> announcements = new ArrayList<>();
        
        // Regular Announcements
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Thông báo bảo trì thang máy tòa A")
            .content("Thang máy tòa A sẽ được bảo trì định kỳ từ 8:00-12:00 ngày 15/12/2024. Vui lòng sử dụng thang máy khác trong thời gian này. Chúng tôi xin lỗi vì sự bất tiện này.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Thông báo về phí dịch vụ tháng 12/2024")
            .content("Phí dịch vụ tháng 12/2024 sẽ tăng 5% do chi phí điện nước tăng. Vui lòng thanh toán đúng hạn để tránh phí trễ hạn. Chi tiết xem trong phần hóa đơn.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Thông báo về dịch vụ vệ sinh")
            .content("Dịch vụ vệ sinh sẽ được thực hiện vào thứ 2 và thứ 6 hàng tuần. Vui lòng để rác đúng nơi quy định và không để rác ở hành lang.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        // Urgent Announcements
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("THÔNG BÁO KHẨN: Mất điện bảo trì")
            .content("Sẽ có kế hoạch cắt điện bảo trì từ 22:00-06:00 ngày 20/12/2024. Vui lòng chuẩn bị đèn pin và các thiết bị cần thiết. Điện sẽ được khôi phục sớm nhất có thể.")
            .type("URGENT")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("THÔNG BÁO KHẨN: Bảo mật an ninh")
            .content("Vui lòng đóng cửa cẩn thận và không cho người lạ vào tòa nhà. Báo cáo ngay nếu thấy hành vi đáng ngờ. Số điện thoại bảo vệ: 0901234567")
            .type("URGENT")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        // Event Announcements
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Sự kiện Tết 2025 - Chương trình đón năm mới")
            .content("Chương trình đón Tết 2025 sẽ diễn ra tại sảnh chính từ 18:00-22:00 ngày 30/12/2024. Có múa lân, ẩm thực truyền thống, và nhiều hoạt động vui nhộn. Mời tất cả cư dân tham gia!")
            .type("EVENT")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Thông báo về dịch vụ internet")
            .content("Dịch vụ internet sẽ được nâng cấp vào ngày 28/12/2024. Có thể bị gián đoạn từ 2:00-4:00 sáng. Tốc độ internet sẽ được cải thiện đáng kể sau nâng cấp.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Thông báo về bảo trì hệ thống nước")
            .content("Hệ thống nước sẽ được bảo trì từ 14:00-18:00 ngày 25/12/2024. Vui lòng dự trữ nước đủ dùng trong thời gian này. Nước sẽ được khôi phục sớm nhất có thể.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        // 5.2 Create Diverse Events
        List<Event> events = new ArrayList<>();
        
        events.add(eventRepository.save(Event.builder()
            .title("Tiệc Giáng sinh 2024 - Gala Dinner")
            .description("Tiệc Giáng sinh sang trọng cho cư dân với nhiều hoạt động vui nhộn, ẩm thực đa dạng và chương trình văn nghệ đặc sắc")
            .startTime(LocalDateTime.of(2024, 12, 24, 18, 0))
            .endTime(LocalDateTime.of(2024, 12, 24, 22, 0))
            .location("Sảnh chính tòa A - Golden Tower")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Họp cư dân tháng 12 - Thảo luận quy hoạch 2025")
            .description("Họp cư dân định kỳ để thảo luận các vấn đề chung, quy hoạch cải tiến và nghe ý kiến phản hồi từ cư dân")
            .startTime(LocalDateTime.of(2024, 12, 15, 19, 0))
            .endTime(LocalDateTime.of(2024, 12, 15, 21, 0))
            .location("Phòng sinh hoạt cộng đồng")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Lớp yoga miễn phí - Sáng chủ nhật")
            .description("Lớp yoga miễn phí cho cư dân mỗi sáng Chủ nhật, phù hợp cho mọi lứa tuổi, có huấn luyện viên chuyên nghiệp")
            .startTime(LocalDateTime.of(2024, 12, 22, 7, 0))
            .endTime(LocalDateTime.of(2024, 12, 22, 8, 30))
            .location("Phòng gym - Tầng 2")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Workshop nấu ăn truyền thống Việt Nam")
            .description("Workshop nấu ăn truyền thống Việt Nam với các món ăn đặc trưng, có đầu bếp chuyên nghiệp hướng dẫn")
            .startTime(LocalDateTime.of(2024, 12, 28, 14, 0))
            .endTime(LocalDateTime.of(2024, 12, 28, 17, 0))
            .location("Khu BBQ ngoài trời")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Giải tennis cư dân 2025 - Mùa giải mới")
            .description("Giải đấu tennis thường niên cho cư dân với nhiều hạng mục thi đấu, có giải thưởng hấp dẫn")
            .startTime(LocalDateTime.of(2025, 7, 1, 8, 0))
            .endTime(LocalDateTime.of(2025, 12, 31, 18, 0))
            .location("Sân tennis chuyên nghiệp")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Lớp học nấu ăn - Món ăn châu Á")
            .description("Lớp học nấu ăn châu Á với các món ăn từ Nhật Bản, Hàn Quốc, Thái Lan và Trung Quốc")
            .startTime(LocalDateTime.of(2025, 1, 15, 14, 0))
            .endTime(LocalDateTime.of(2025, 1, 15, 17, 0))
            .location("Phòng sinh hoạt cộng đồng")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Họp cư dân tháng 1/2025 - Kế hoạch năm mới")
            .description("Họp cư dân định kỳ để thảo luận kế hoạch năm mới, cải tiến dịch vụ và nghe ý kiến phản hồi")
            .startTime(LocalDateTime.of(2025, 1, 15, 19, 0))
            .endTime(LocalDateTime.of(2025, 1, 15, 21, 0))
            .location("Phòng họp đa năng")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Tiệc mừng năm mới 2025 - Countdown Party")
            .description("Tiệc mừng năm mới 2025 với chương trình countdown, âm nhạc sôi động và nhiều hoạt động vui nhộn")
            .startTime(LocalDateTime.of(2025, 1, 1, 18, 0))
            .endTime(LocalDateTime.of(2025, 1, 1, 23, 0))
            .location("Sảnh chính tòa A - Golden Tower")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Hội thảo bảo mật an ninh - Diễn ra 3 ngày")
            .description("Hội thảo về bảo mật an ninh cho cư dân với các chuyên gia, diễn ra trong 3 ngày liên tiếp")
            .startTime(LocalDateTime.of(2025, 2, 10, 9, 0))
            .endTime(LocalDateTime.of(2025, 2, 12, 17, 0))
            .location("Phòng họp đa năng - Tầng 1")
            .build()));
        
        System.out.println("✅ Created " + announcements.size() + " announcements and " + events.size() + " events");
    }

    /**
     * PART 6: Initialize Facility Bookings
     */
    private void initializeFacilityBookings() {
        System.out.println("📅 Initializing Facility Bookings...");
        
        // Get all facilities and resident users
        List<Facility> facilities = facilityRepository.findAll();
        List<User> residentUsers = userRepository.findAllWithRoles().stream()
            .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(role -> "RESIDENT".equals(role.getName())))
            .collect(Collectors.toList());
        
        if (facilities.isEmpty() || residentUsers.isEmpty()) {
            System.out.println("⚠️ No facilities or resident users found, skipping facility bookings");
            return;
        }
        
        // 6.1 Create Diverse Facility Bookings
        List<FacilityBooking> bookings = new ArrayList<>();
        
        // Past bookings (completed)
        for (int i = 0; i < Math.min(10, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get(i % facilities.size());
            
            // Past booking - completed
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(LocalDateTime.now().minusDays(7 + i))
                .duration(60)
                .status(FacilityBookingStatus.CONFIRMED)
                .numberOfPeople(2 + (i % 4))
                .build()));
            
            // Past booking - rejected
            if (i % 3 == 0) {
                bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                    .facility(facility)
                    .user(resident)
                    .bookingTime(LocalDateTime.now().minusDays(5 + i))
                    .duration(90)
                    .status(FacilityBookingStatus.REJECTED)
                    .numberOfPeople(3 + (i % 3))
                    .build()));
            }
        }
        
        // Current bookings (pending/confirmed)
        for (int i = 0; i < Math.min(15, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get((i + 1) % facilities.size());
            
            // Current booking - pending
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(LocalDateTime.now().plusDays(1 + i))
                .duration(120)
                .status(FacilityBookingStatus.PENDING)
                .numberOfPeople(4 + (i % 3))
                .build()));
            
            // Current booking - confirmed
            if (i % 2 == 0) {
                bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                    .facility(facility)
                    .user(resident)
                    .bookingTime(LocalDateTime.now().plusDays(2 + i))
                    .duration(180)
                    .status(FacilityBookingStatus.CONFIRMED)
                    .numberOfPeople(6 + (i % 4))
                    .build()));
            }
        }
        
        // Future bookings (upcoming)
        for (int i = 0; i < Math.min(20, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get((i + 2) % facilities.size());
            
            // Future booking - confirmed
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(LocalDateTime.now().plusDays(7 + i))
                .duration(240)
                .status(FacilityBookingStatus.CONFIRMED)
                .numberOfPeople(8 + (i % 5))
                .build()));
            
            // Future booking - pending
            if (i % 3 == 0) {
                bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                    .facility(facility)
                    .user(resident)
                    .bookingTime(LocalDateTime.now().plusDays(10 + i))
                    .duration(300)
                    .status(FacilityBookingStatus.PENDING)
                    .numberOfPeople(10 + (i % 6))
                    .build()));
            }
        }
        
        // Special bookings (large groups, special events)
        for (int i = 0; i < Math.min(5, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get(0); // Community room for large events
            
            // Large group booking
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(LocalDateTime.now().plusDays(15 + i))
                .duration(480) // 8 hours
                .status(FacilityBookingStatus.CONFIRMED)
                .numberOfPeople(20 + (i * 5))
                .build()));
        }
        
        // Rejected bookings
        for (int i = 0; i < Math.min(8, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get((i + 3) % facilities.size());
            
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(LocalDateTime.now().plusDays(3 + i))
                .duration(60)
                .status(FacilityBookingStatus.REJECTED)
                .numberOfPeople(2)
                .build()));
        }
        
        System.out.println("✅ Created " + bookings.size() + " facility bookings with diverse scenarios");
    }

    /**
     * PART 7: Initialize Invoices and Payments
     */
    private void initializeInvoicesAndPayments() {
        System.out.println("💰 Initializing Invoices and Payments...");
        
        // Get all apartments with residents
        List<Apartment> apartmentsWithResidents = apartmentRepository.findAll().stream()
            .filter(apt -> !apartmentResidentRepository.findByApartment_Id(apt.getId()).isEmpty())
            .collect(Collectors.toList());
        
        if (apartmentsWithResidents.isEmpty()) {
            System.out.println("⚠️ No apartments with residents found, skipping invoices");
            return;
        }
        
        // 7.1 Create Diverse Invoices for each apartment
        List<Invoice> invoices = new ArrayList<>();
        
        for (Apartment apartment : apartmentsWithResidents) {
            // Create invoices for different billing periods
            String[] billingPeriods = {"2024-11", "2024-10", "2024-09", "2024-08", "2024-07"};
            InvoiceStatus[] statuses = {InvoiceStatus.UNPAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.PAID, InvoiceStatus.PAID};
            
            for (int i = 0; i < billingPeriods.length; i++) {
                // Check if invoice already exists
                boolean hasInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartment.getId(), billingPeriods[i]).isPresent();
                
                if (!hasInvoice) {
                    double baseAmount = 800000.0 + (apartment.getArea() * 1000) + (i * 50000);
                    double paidAmount = statuses[i] == InvoiceStatus.PAID ? baseAmount : (statuses[i] == InvoiceStatus.OVERDUE ? baseAmount * 0.7 : 0);
                    double remainingAmount = baseAmount - paidAmount;
                    
                    Invoice invoice = invoiceRepository.save(Invoice.builder()
                        .apartmentId(apartment.getId())
                        .billingPeriod(billingPeriods[i])
                        .issueDate(LocalDate.of(2024, 11 - i, 1))
                        .dueDate(LocalDate.of(2024, 11 - i, 15))
                        .totalAmount(baseAmount)
                        .status(statuses[i])
                        .build());
                    
                    invoices.add(invoice);
                    
                    // 7.2 Create Invoice Items for each invoice
                    createInvoiceItems(invoice, apartment.getArea());
                }
            }
        }
        
        // 7.3 Create Payment Records for paid invoices
        List<Payment> payments = new ArrayList<>();
        
        for (Invoice invoice : invoices) {
            if (invoice.getStatus() == InvoiceStatus.PAID) {
                // Create payment record
                Payment payment = paymentRepository.save(Payment.builder()
                    .invoice(invoice)
                    .paidByUserId(invoice.getApartmentId()) // Using apartment ID as user ID for simplicity
                    .amount(invoice.getTotalAmount())
                    .method(PaymentMethod.BANK_TRANSFER)
                    .status(PaymentStatus.SUCCESS)
                    .referenceCode("PAY" + System.currentTimeMillis())
                    .build());
                
                payments.add(payment);
            }
        }
        
        System.out.println("✅ Created " + invoices.size() + " invoices and " + payments.size() + " payments");
    }
    
    /**
     * Helper method to create invoice items
     */
    private void createInvoiceItems(Invoice invoice, double apartmentArea) {
        // Create diverse invoice items
        String[] feeTypes = {"ELECTRICITY", "WATER", "PARKING", "INTERNET", "MAINTENANCE", "CLEANING", "SECURITY", "GARDENING"};
        String[] descriptions = {
            "Phí điện sinh hoạt",
            "Phí nước sinh hoạt", 
            "Phí giữ xe tháng",
            "Phí internet và truyền hình",
            "Phí bảo trì chung",
            "Phí vệ sinh chung",
            "Phí an ninh",
            "Phí chăm sóc cây xanh"
        };
        
        double[] baseAmounts = {300000.0, 200000.0, 150000.0, 100000.0, 250000.0, 180000.0, 120000.0, 80000.0};
        
        for (int i = 0; i < feeTypes.length; i++) {
            double amount = baseAmounts[i] + (apartmentArea * 50) + (Math.random() * 50000);
            
            invoiceItemRepository.save(InvoiceItem.builder()
                .invoice(invoice)
                .feeType(feeTypes[i])
                .description(descriptions[i])
                .amount(amount)
                .build());
        }
    }

    /**
     * PART 8: Initialize Service Requests and Feedback
     */
    private void initializeServiceRequestsAndFeedback() {
        System.out.println("🔧 Initializing Service Requests and Feedback...");
        
        // Get all users and service categories
        List<User> allUsers = userRepository.findAllWithRoles();
        List<ServiceCategory> serviceCategories = serviceCategoryRepository.findAll();
        
        if (serviceCategories.isEmpty()) {
            System.out.println("⚠️ No service categories found, skipping service requests");
            return;
        }
        
        // 8.1 Create Diverse Service Requests
        List<ServiceRequest> serviceRequests = new ArrayList<>();
        
        // Get resident users
        List<User> residentUsers = allUsers.stream()
            .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(role -> "RESIDENT".equals(role.getName())))
            .collect(Collectors.toList());
        
        // Get staff users for assignment
        List<User> staffUsers = allUsers.stream()
            .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(role -> "STAFF".equals(role.getName()) || "TECHNICIAN".equals(role.getName())))
            .collect(Collectors.toList());
        
        String[] requestTitles = {
            "Sửa chữa điều hòa không hoạt động",
            "Thay bóng đèn hành lang bị cháy",
            "Sửa vòi nước bị rò rỉ",
            "Dọn dẹp rác thải ở sân chung",
            "Kiểm tra hệ thống điện",
            "Sửa chữa thang máy bị lỗi",
            "Bảo trì hệ thống nước",
            "Vệ sinh khu vực chung",
            "Sửa chữa cửa tự động",
            "Kiểm tra camera an ninh",
            "Cắt tỉa cây xanh",
            "Sửa chữa wifi không ổn định",
            "Thay khóa cửa bị hỏng",
            "Sửa chữa máy bơm nước",
            "Dọn dẹp bãi đỗ xe"
        };
        
        String[] requestDescriptions = {
            "Điều hòa trong phòng khách không hoạt động, cần kiểm tra và sửa chữa gấp",
            "Bóng đèn hành lang tầng 5 bị cháy, cần thay thế để đảm bảo an toàn",
            "Vòi nước trong nhà bếp bị rò rỉ, cần sửa chữa để tránh lãng phí nước",
            "Rác thải tích tụ ở sân chung, cần dọn dẹp để giữ vệ sinh",
            "Hệ thống điện có dấu hiệu bất thường, cần kiểm tra để đảm bảo an toàn",
            "Thang máy tòa A bị lỗi, cần sửa chữa để cư dân sử dụng",
            "Hệ thống nước có vấn đề, cần bảo trì định kỳ",
            "Khu vực chung cần được vệ sinh sạch sẽ",
            "Cửa tự động ở lối vào bị hỏng, cần sửa chữa",
            "Camera an ninh không hoạt động, cần kiểm tra và sửa chữa",
            "Cây xanh cần được cắt tỉa để đảm bảo thẩm mỹ",
            "Wifi không ổn định, cần kiểm tra và khắc phục",
            "Khóa cửa chính bị hỏng, cần thay thế để đảm bảo an toàn",
            "Máy bơm nước bị lỗi, cần sửa chữa để đảm bảo cung cấp nước",
            "Bãi đỗ xe cần được dọn dẹp và sắp xếp lại"
        };
        
        // Create service requests with different statuses
        for (int i = 0; i < Math.min(20, residentUsers.size()); i++) {
            User resident = residentUsers.get(i % residentUsers.size());
            ServiceCategory category = serviceCategories.get(i % serviceCategories.size());
            User assignedStaff = staffUsers.isEmpty() ? null : staffUsers.get(i % staffUsers.size());
            
            // Determine status based on index
            ServiceRequestStatus status;
            if (i < 5) status = ServiceRequestStatus.OPEN;
            else if (i < 10) status = ServiceRequestStatus.IN_PROGRESS;
            else if (i < 15) status = ServiceRequestStatus.COMPLETED;
            else status = ServiceRequestStatus.CANCELLED;
            
            ServiceRequestPriority priority = (i % 3 == 0) ? ServiceRequestPriority.P1 : 
                                           (i % 3 == 1) ? ServiceRequestPriority.P3 : 
                                           ServiceRequestPriority.P4;
            
            ServiceRequest request = serviceRequestRepository.save(ServiceRequest.builder()
                .user(resident)
                .title(requestTitles[i % requestTitles.length])
                .category(category)
                .description(requestDescriptions[i % requestDescriptions.length])
                .submittedAt(LocalDateTime.now().minusDays(10 - i))
                .assignedTo(assignedStaff)
                .assignedAt(assignedStaff != null ? LocalDateTime.now().minusDays(8 - i) : null)
                .status(status)
                .priority(priority)
                .resolutionNotes(status == ServiceRequestStatus.COMPLETED ? "Đã hoàn thành theo yêu cầu" : null)
                .completedAt(status == ServiceRequestStatus.COMPLETED ? LocalDateTime.now().minusDays(5 - i) : null)
                .rating(status == ServiceRequestStatus.COMPLETED ? 4 + (i % 2) : null)
                .build());
            
            serviceRequests.add(request);
        }
        
        // 8.2 Create Feedback Categories and Feedback
        List<FeedbackCategory> feedbackCategories = new ArrayList<>();
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("GENERAL_SERVICE")
            .categoryName("Dịch vụ chung")
            .description("Phản hồi về các dịch vụ chung của tòa nhà")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("SECURITY")
            .categoryName("An ninh")
            .description("Phản hồi về hệ thống an ninh và bảo vệ")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("CLEANING")
            .categoryName("Vệ sinh")
            .description("Phản hồi về dịch vụ vệ sinh và dọn dẹp")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("FACILITIES")
            .categoryName("Tiện ích")
            .description("Phản hồi về các tiện ích và cơ sở vật chất")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("MANAGEMENT")
            .categoryName("Quản lý")
            .description("Phản hồi về dịch vụ quản lý và hỗ trợ")
            .build()));
        
        // 8.3 Create Diverse Feedback
        List<Feedback> feedbacks = new ArrayList<>();
        
        String[] feedbackContents = {
            "Dịch vụ vệ sinh rất tốt, nhân viên làm việc chuyên nghiệp",
            "Hệ thống an ninh cần được cải thiện, camera có vấn đề",
            "Tiện ích gym rất tốt, thiết bị hiện đại và sạch sẽ",
            "Quản lý phản hồi chậm, cần cải thiện thời gian xử lý",
            "Khu vực chung cần được vệ sinh thường xuyên hơn",
            "Dịch vụ internet ổn định, tốc độ tốt",
            "Bảo vệ làm việc rất tốt, an toàn cho cư dân",
            "Cần thêm tiện ích cho trẻ em",
            "Hệ thống thang máy hoạt động tốt",
            "Cần cải thiện hệ thống thông báo"
        };
        
        String[] responses = {
            "Cảm ơn phản hồi tích cực của bạn. Chúng tôi sẽ duy trì chất lượng dịch vụ",
            "Chúng tôi đã ghi nhận vấn đề và sẽ khắc phục trong thời gian sớm nhất",
            "Rất vui khi bạn hài lòng với dịch vụ. Chúng tôi sẽ tiếp tục cải thiện",
            "Xin lỗi vì sự bất tiện. Chúng tôi sẽ cải thiện thời gian phản hồi",
            "Chúng tôi sẽ tăng cường tần suất vệ sinh khu vực chung",
            "Cảm ơn phản hồi tích cực về dịch vụ internet",
            "Cảm ơn sự ghi nhận của bạn về đội ngũ bảo vệ",
            "Chúng tôi đang lên kế hoạch bổ sung tiện ích cho trẻ em",
            "Cảm ơn phản hồi tích cực về hệ thống thang máy",
            "Chúng tôi sẽ cải thiện hệ thống thông báo để phục vụ tốt hơn"
        };
        
        for (int i = 0; i < Math.min(15, residentUsers.size()); i++) {
            User resident = residentUsers.get(i % residentUsers.size());
            FeedbackCategory category = feedbackCategories.get(i % feedbackCategories.size());
            
            FeedbackStatus status = (i < 10) ? FeedbackStatus.RESPONDED : FeedbackStatus.PENDING;
            
            Feedback feedback = feedbackRepository.save(Feedback.builder()
                .user(resident)
                .category(category)
                .content(feedbackContents[i % feedbackContents.length])
                .submittedAt(LocalDateTime.now().minusDays(15 - i))
                .status(status)
                .response(status == FeedbackStatus.RESPONDED ? responses[i % responses.length] : null)
                .respondedAt(status == FeedbackStatus.RESPONDED ? LocalDateTime.now().minusDays(10 - i) : null)
                .build());
            
            feedbacks.add(feedback);
        }
        
        System.out.println("✅ Created " + serviceRequests.size() + " service requests and " + feedbacks.size() + " feedback items");
    }

    /**
     * PART 9: Initialize Activity Logs and AI QA
     */
    private void initializeActivityLogsAndAiQa() {
        System.out.println("📝 Initializing Activity Logs and AI QA...");
        
        // Get all users
        List<User> allUsers = userRepository.findAllWithRoles();
        
        // 9.1 Create Activity Logs
        List<ActivityLog> activityLogs = new ArrayList<>();
        
        String[] activities = {
            "Đăng nhập hệ thống",
            "Xem thông báo mới",
            "Đặt tiện ích phòng gym",
            "Thanh toán hóa đơn tháng 12",
            "Báo cáo sự cố điều hòa",
            "Đăng ký tham gia sự kiện Giáng sinh",
            "Cập nhật thông tin cá nhân",
            "Xem lịch sử thanh toán",
            "Đặt tiện ích hồ bơi",
            "Gửi phản hồi về dịch vụ",
            "Xem thông tin căn hộ",
            "Tải xuống hóa đơn",
            "Đặt lịch hẹn với quản lý",
            "Xem thông báo bảo trì",
            "Đăng ký nhận thông báo"
        };
        
        ActivityActionType[] actionTypes = {
            ActivityActionType.LOGIN,
            ActivityActionType.VIEW_ANNOUNCEMENT,
            ActivityActionType.CREATE_FACILITY_BOOKING,
            ActivityActionType.PAYMENT,
            ActivityActionType.CREATE_SERVICE_REQUEST,
            ActivityActionType.REGISTER_EVENT,
            ActivityActionType.UPDATE_USER,
            ActivityActionType.VIEW_INVOICE,
            ActivityActionType.CREATE_FACILITY_BOOKING,
            ActivityActionType.SUBMIT_FEEDBACK,
            ActivityActionType.VIEW_ANNOUNCEMENT,
            ActivityActionType.DOWNLOAD_INVOICE,
            ActivityActionType.CREATE_SUPPORT_REQUEST,
            ActivityActionType.VIEW_ANNOUNCEMENT,
            ActivityActionType.UPDATE_USER
        };
        
        for (int i = 0; i < Math.min(50, allUsers.size() * 3); i++) {
            User user = allUsers.get(i % allUsers.size());
            
            ActivityLog log = activityLogRepository.save(ActivityLog.builder()
                .user(user)
                .actionType(actionTypes[i % actionTypes.length])
                .description(activities[i % activities.length])
                .ipAddress("192.168.1." + (100 + (i % 50)))
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .resourceType("WEB")
                .resourceId((long) (i + 1))
                .build());
            
            activityLogs.add(log);
        }
        
        // 9.2 Create AI QA History
        List<AiQaHistory> aiQaHistories = new ArrayList<>();
        
        String[] questions = {
            "Làm thế nào để đặt tiện ích phòng gym?",
            "Phí dịch vụ tháng này bao nhiêu?",
            "Cách thanh toán hóa đơn online?",
            "Thời gian mở cửa hồ bơi?",
            "Làm sao để báo cáo sự cố?",
            "Có thể đăng ký tham gia sự kiện không?",
            "Cách cập nhật thông tin cá nhân?",
            "Lịch vệ sinh chung khi nào?",
            "Thông tin về bảo mật an ninh?",
            "Cách liên hệ quản lý tòa nhà?"
        };
        
        String[] answers = {
            "Bạn có thể đặt tiện ích phòng gym thông qua ứng dụng hoặc website. Vào mục 'Tiện ích' -> 'Đặt tiện ích' -> Chọn phòng gym và thời gian phù hợp.",
            "Phí dịch vụ tháng này bao gồm: Điện: 300,000đ, Nước: 200,000đ, Vệ sinh: 150,000đ, An ninh: 100,000đ. Tổng cộng: 750,000đ.",
            "Bạn có thể thanh toán online qua: 1) Chuyển khoản ngân hàng, 2) Ví điện tử (MoMo, ZaloPay), 3) Thẻ tín dụng. Vào mục 'Thanh toán' để thực hiện.",
            "Hồ bơi mở cửa từ 6:00-21:00 hàng ngày. Có cứu hộ chuyên nghiệp và phòng thay đồ sạch sẽ.",
            "Để báo cáo sự cố, bạn có thể: 1) Gọi hotline 0901234567, 2) Gửi yêu cầu qua ứng dụng, 3) Liên hệ trực tiếp với quản lý.",
            "Có, bạn có thể đăng ký tham gia sự kiện qua ứng dụng. Vào mục 'Sự kiện' -> Chọn sự kiện muốn tham gia -> Nhấn 'Đăng ký'.",
            "Để cập nhật thông tin cá nhân: Vào 'Hồ sơ cá nhân' -> 'Chỉnh sửa' -> Cập nhật thông tin -> 'Lưu'.",
            "Lịch vệ sinh chung: Thứ 2 và Thứ 6 hàng tuần từ 8:00-12:00. Vui lòng để rác đúng nơi quy định.",
            "Hệ thống an ninh 24/7 với camera giám sát, bảo vệ tuần tra, cửa tự động. Báo cáo ngay nếu thấy hành vi đáng ngờ.",
            "Liên hệ quản lý: Hotline 0901234567, Email: manager@apartment.com, Văn phòng: Tầng 1 tòa A."
        };
        
        for (int i = 0; i < Math.min(20, allUsers.size()); i++) {
            User user = allUsers.get(i % allUsers.size());
            
            AiQaHistory qaHistory = aiQaHistoryRepository.save(AiQaHistory.builder()
                .user(user)
                .question(questions[i % questions.length])
                .aiAnswer(answers[i % answers.length])
                .askedAt(LocalDateTime.now().minusDays(5 + i))
                .responseTime(1000 + (i * 100))
                .feedback(i % 3 == 0 ? "POSITIVE" : (i % 3 == 1 ? "NEGATIVE" : "NEUTRAL"))
                .build());
            
            aiQaHistories.add(qaHistory);
        }
        
        System.out.println("✅ Created " + activityLogs.size() + " activity logs and " + aiQaHistories.size() + " AI QA histories");
    }

    /**
     * PART 10: Initialize Vehicles
     */
    private void initializeVehicles() {
        System.out.println("🚗 Initializing Vehicles...");
        
        // Get resident users
        List<User> residentUsers = userRepository.findAllWithRoles().stream()
            .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(role -> "RESIDENT".equals(role.getName())))
            .collect(Collectors.toList());
        
        List<Apartment> apartments = apartmentRepository.findAll();
        
        if (residentUsers.isEmpty() || apartments.isEmpty()) {
            System.out.println("⚠️ No resident users or apartments found, skipping vehicles");
            return;
        }
        
        // 10.1 Create Diverse Vehicles
        List<Vehicle> vehicles = new ArrayList<>();
        
        String[] licensePlates = {
            "30A-12345", "30A-12346", "30A-12347", "30A-12348", "30A-12349",
            "30B-12350", "30B-12351", "30B-12352", "30B-12353", "30B-12354",
            "30C-12355", "30C-12356", "30C-12357", "30C-12358", "30C-12359",
            "30D-12360", "30D-12361", "30D-12362", "30D-12363", "30D-12364"
        };
        
        String[] brands = {"Toyota", "Honda", "Ford", "Hyundai", "Kia", "Mazda", "Nissan", "BMW", "Mercedes", "Audi"};
        String[] models = {"Vios", "City", "Ranger", "Accent", "Rio", "3", "Sunny", "X3", "C-Class", "A4"};
        String[] colors = {"Trắng", "Đen", "Bạc", "Xanh", "Đỏ", "Xám", "Vàng", "Cam", "Tím", "Nâu"};
        
        for (int i = 0; i < Math.min(15, residentUsers.size()); i++) {
            User resident = residentUsers.get(i % residentUsers.size());
            Apartment apartment = apartments.get(i % apartments.size());
            
            VehicleType vehicleType = (i % 3 == 0) ? VehicleType.CAR_4_SEATS : 
                                    (i % 3 == 1) ? VehicleType.MOTORCYCLE : 
                                    VehicleType.BICYCLE;
            
            VehicleStatus status = (i < 10) ? VehicleStatus.APPROVED : 
                                 (i < 12) ? VehicleStatus.PENDING : 
                                 VehicleStatus.REJECTED;
            
            Vehicle vehicle = vehicleRepository.save(Vehicle.builder()
                .licensePlate(licensePlates[i % licensePlates.length])
                .vehicleType(vehicleType)
                .brand(brands[i % brands.length])
                .model(models[i % models.length])
                .color(colors[i % colors.length])
                .imageUrls("vehicle_" + (i + 1) + ".jpg")
                .status(status)
                .monthlyFee(vehicleType == VehicleType.CAR_4_SEATS ? new BigDecimal("200000") : 
                           vehicleType == VehicleType.MOTORCYCLE ? new BigDecimal("50000") : new BigDecimal("20000"))
                .user(resident)
                .apartment(apartment)
                .build());
            
            vehicles.add(vehicle);
        }
        
        System.out.println("✅ Created " + vehicles.size() + " vehicles with diverse information");
    }

    /**
     * PART 11: Initialize Emergency Contacts and Additional Data
     */
    private void initializeEmergencyContactsAndAdditionalData() {
        System.out.println("📞 Initializing Emergency Contacts and Additional Data...");
        
        // Get resident users
        List<User> residentUsers = userRepository.findAllWithRoles().stream()
            .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(role -> "RESIDENT".equals(role.getName())))
            .collect(Collectors.toList());
        
        if (residentUsers.isEmpty()) {
            System.out.println("⚠️ No resident users found, skipping emergency contacts");
            return;
        }
        
        // 11.1 Create Emergency Contacts
        List<EmergencyContact> emergencyContacts = new ArrayList<>();
        
        String[] contactNames = {
            "Nguyễn Văn Bố", "Trần Thị Mẹ", "Lê Văn Anh", "Phạm Thị Chị", "Hoàng Văn Em",
            "Đặng Thị Vợ", "Vũ Văn Chồng", "Bùi Thị Con", "Ngô Văn Bạn", "Lý Thị Hàng Xóm"
        };
        
        String[] relationships = {
            "Bố", "Mẹ", "Anh trai", "Chị gái", "Em trai",
            "Vợ", "Chồng", "Con", "Bạn thân", "Hàng xóm"
        };
        
        String[] phoneNumbers = {
            "0901234580", "0901234581", "0901234582", "0901234583", "0901234584",
            "0901234585", "0901234586", "0901234587", "0901234588", "0901234589"
        };
        
        String[] emails = {
            "bo@gmail.com", "me@gmail.com", "anh@gmail.com", "chi@gmail.com", "em@gmail.com",
            "vo@gmail.com", "chong@gmail.com", "con@gmail.com", "ban@gmail.com", "hangxom@gmail.com"
        };
        
        for (int i = 0; i < Math.min(10, residentUsers.size()); i++) {
            User resident = residentUsers.get(i % residentUsers.size());
            
            EmergencyContact contact = EmergencyContact.builder()
                .user(resident)
                .name(contactNames[i % contactNames.length])
                .relationship(relationships[i % relationships.length])
                .phone(phoneNumbers[i % phoneNumbers.length])
                .build();
            
            emergencyContacts.add(contact);
        }
        
        // 11.2 Create Event Registrations
        List<EventRegistration> eventRegistrations = new ArrayList<>();
        
        List<Event> events = eventRepository.findAll();
        if (!events.isEmpty()) {
            for (int i = 0; i < Math.min(20, residentUsers.size()); i++) {
                User resident = residentUsers.get(i % residentUsers.size());
                Event event = events.get(i % events.size());
                
                EventRegistrationStatus status = (i < 15) ? EventRegistrationStatus.REGISTERED : 
                                              (i < 18) ? EventRegistrationStatus.CANCELLED : 
                                              EventRegistrationStatus.ATTENDED;
                
                EventRegistration registration = eventRegistrationRepository.save(EventRegistration.builder()
                    .event(event)
                    .user(resident)
                    .status(status)
                    .registeredAt(LocalDateTime.now().minusDays(10 - i))
                    .build());
                
                eventRegistrations.add(registration);
            }
        }
        
        System.out.println("✅ Created " + emergencyContacts.size() + " emergency contacts and " + eventRegistrations.size() + " event registrations");
        
        // 11.3 Clean up duplicate event registrations
        cleanupDuplicateEventRegistrations();
        
        System.out.println("🎉 All data initialization completed successfully!");
    }
    
    /**
     * Helper method to clean up duplicate event registrations
     */
    private void cleanupDuplicateEventRegistrations() {
        System.out.println("🧹 Cleaning up duplicate event registrations...");
        
        List<EventRegistration> allRegistrations = eventRegistrationRepository.findAll();
        Set<String> seen = new HashSet<>();
        List<EventRegistration> toDelete = new ArrayList<>();
        
        for (EventRegistration registration : allRegistrations) {
            String key = registration.getEvent().getId() + "-" + registration.getUser().getId();
            if (seen.contains(key)) {
                toDelete.add(registration);
            } else {
                seen.add(key);
            }
        }
        
        if (!toDelete.isEmpty()) {
            eventRegistrationRepository.deleteAll(toDelete);
            System.out.println("🗑️ Deleted " + toDelete.size() + " duplicate event registrations");
        }
    }
} 