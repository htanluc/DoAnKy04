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
import com.mytech.apartment.portal.entities.*;
import com.mytech.apartment.portal.repositories.*;
import com.mytech.apartment.portal.repositories.FeedbackCategoryRepository;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import java.math.BigDecimal;
import java.time.YearMonth;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.VehicleCapacityConfigRepository;

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
    @Autowired private AnnouncementReadRepository announcementReadRepository;
    @Autowired private PaymentTransactionRepository paymentTransactionRepository;
    @Autowired private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private ApartmentInvitationRepository apartmentInvitationRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private FeedbackCategoryRepository feedbackCategoryRepository;
    @Autowired private WaterMeterReadingRepository waterMeterReadingRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private VehicleCapacityConfigRepository vehicleCapacityConfigRepository;
    @Autowired private ServiceFeeConfigRepository serviceFeeConfigRepository;
    // @Autowired private PaymentMethodRepository paymentMethodRepository; // Comment out if not exists
    // @Autowired private EmergencyContactRepository emergencyContactRepository; // Comment out if not exists
    // @Autowired private ApartmentInvitationRepository apartmentInvitationRepository; // Comment out if not exists
    // @Autowired private ServiceFeeConfigRepository serviceFeeConfigRepository; // Comment out if not exists

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Starting comprehensive data initialization...");

        // Guard: nếu dữ liệu lõi đã tồn tại thì bỏ qua seeding
        if (roleRepository.count() > 0 || userRepository.count() > 0 || buildingRepository.count() > 0) {
            System.out.println("⏭️ Data already present. Skipping DataInitializer.");
            // Nhưng vẫn tạo dữ liệu chỉ số nước nếu chưa có
            if (waterMeterReadingRepository.count() == 0) {
                System.out.println("💧 No water meter readings found. Creating sample data...");
                initializeWaterMeterReadings();
            }
            return;
        }
        
        // PART 1: ROLES & USERS (Enhanced with more realistic data)
        initializeRolesAndUsers();
        
        // PART 2: BUILDINGS & APARTMENTS
        initializeBuildingsAndApartments();
        
        // PART 3: APARTMENT RESIDENTS (Many-to-many relationships)
        initializeApartmentResidents();
        
        // PART 4: FACILITIES & SERVICE CATEGORIES
        initializeFacilitiesAndServiceCategories();
        
        // PART 4.0: SERVICE FEE CONFIG (for last 9 months)
        initializeServiceFeeConfigsForNineMonths();

        // PART 5: ANNOUNCEMENTS & EVENTS
        initializeAnnouncementsAndEvents();
        
        // PART 6: FACILITY BOOKINGS
        initializeFacilityBookings();
        
        // PART 4.5: WATER METER READINGS (before invoices)
        initializeWaterMeterReadings();

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
            .description("System administrator - full access to all features")
            .build());
        
        Role staffRole = roleRepository.save(Role.builder()
            .name("STAFF")
            .description("Staff - manage apartments, services and residents")
            .build());
        
        Role residentRole = roleRepository.save(Role.builder()
            .name("RESIDENT")
            .description("Resident - use facilities, pay invoices and report issues")
            .build());
        
        Role technicianRole = roleRepository.save(Role.builder()
            .name("TECHNICIAN")
            .description("Technician - handle technical incidents and maintenance")
            .build());
        
        Role cleanerRole = roleRepository.save(Role.builder()
            .name("CLEANER")
            .description("Cleaner - sanitation and hygiene maintenance")
            .build());
        
        Role securityRole = roleRepository.save(Role.builder()
            .name("SECURITY")
            .description("Security - patrols and access control")
            .build());

        // 1.2 Create Enhanced Users with complete information
        List<User> users = new ArrayList<>();
        
        // Admin Users
        users.add(createUser("admin", "admin@apartment.com", "0901234567", "John Admin", 
            LocalDate.of(1985, 5, 15), "123456789001", Set.of(adminRole), UserStatus.ACTIVE));
        
        users.add(createUser("manager", "manager@apartment.com", "0901234568", "Mary Manager", 
            LocalDate.of(1988, 8, 20), "123456789002", Set.of(adminRole), UserStatus.ACTIVE));
        
        // Staff Users
        users.add(createUser("staff1", "staff1@apartment.com", "0901234569", "Steven Staff", 
            LocalDate.of(1990, 3, 10), "123456789003", Set.of(staffRole), UserStatus.ACTIVE));
        
        users.add(createUser("staff2", "staff2@apartment.com", "0901234570", "Sarah Staff", 
            LocalDate.of(1992, 7, 25), "123456789004", Set.of(staffRole), UserStatus.ACTIVE));
        
        // Resident Users with diverse information
        users.add(createUser("resident1", "nguyenvanA@gmail.com", "0901234571", "Alex Anderson", 
            LocalDate.of(1980, 1, 15), "123456789005", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident2", "tranthiB@gmail.com", "0901234572", "Bella Brown", 
            LocalDate.of(1982, 4, 22), "123456789006", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident3", "levanC@gmail.com", "0901234573", "Charlie Clark", 
            LocalDate.of(1985, 9, 8), "123456789007", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident4", "phamthiD@gmail.com", "0901234574", "Diana Davis", 
            LocalDate.of(1987, 12, 3), "123456789008", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident5", "hoangvanE@gmail.com", "0901234575", "Evan Edwards", 
            LocalDate.of(1983, 6, 18), "123456789009", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident6", "dangthiF@gmail.com", "0901234576", "Fiona Fisher", 
            LocalDate.of(1989, 11, 12), "123456789010", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident7", "vuthiG@gmail.com", "0901234582", "Grace Green", 
            LocalDate.of(1986, 2, 28), "123456789011", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident8", "dovanH@gmail.com", "0901234583", "Henry Hill", 
            LocalDate.of(1984, 8, 14), "123456789012", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident9", "buithiI@gmail.com", "0901234584", "Ivy Irving", 
            LocalDate.of(1991, 5, 7), "123456789013", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident10", "ngovanJ@gmail.com", "0901234585", "Jack Johnson", 
            LocalDate.of(1981, 10, 30), "123456789014", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident11", "lythiK@gmail.com", "0901234586", "Karen King", 
            LocalDate.of(1988, 3, 25), "123456789015", Set.of(residentRole), UserStatus.ACTIVE));
        
        users.add(createUser("resident12", "hovanL@gmail.com", "0901234587", "Leo Lewis", 
            LocalDate.of(1983, 7, 19), "123456789016", Set.of(residentRole), UserStatus.ACTIVE));

        // Additional 30 resident users
        String[] extraFirstNames = {"Mia","Noah","Olivia","Liam","Emma","Ava","Sophia","Isabella","Mason","Logan",
            "Lucas","Ethan","James","Benjamin","Charlotte","Amelia","Harper","Evelyn","Abigail","Emily",
            "Michael","Elijah","Daniel","Henry","Sebastian","Aiden","Matthew","Jackson","Scarlett","Aria"};
        String[] extraLastNames = {"Taylor","Walker","Harris","Martin","Thompson","White","Lewis","Lee","Clark","Young",
            "Allen","King","Wright","Scott","Green","Baker","Adams","Nelson","Hill","Ramirez",
            "Campbell","Mitchell","Roberts","Carter","Phillips","Evans","Turner","Torres","Parker","Collins"};
        for (int i = 0; i < 30; i++) {
            String username = "resident" + (13 + i);
            String email = username + "@example.com";
            String phone = String.format("0902%06d", 300 + i);
            String fullName = extraFirstNames[i % extraFirstNames.length] + " " + extraLastNames[i % extraLastNames.length];
            users.add(createUser(username, email, phone, fullName,
                LocalDate.of(1980 + (i % 20), 1 + (i % 12), 1 + (i % 28)),
                "77777777" + String.format("%02d", i), Set.of(residentRole), UserStatus.ACTIVE));
        }
        
        // Technician Users
        users.add(createUser("technician1", "technician1@apartment.com", "0901234577", "Tom Technician", 
            LocalDate.of(1985, 4, 5), "123456789017", Set.of(technicianRole), UserStatus.ACTIVE));
        
        users.add(createUser("technician2", "technician2@apartment.com", "0901234578", "Tina Technician", 
            LocalDate.of(1987, 9, 12), "123456789018", Set.of(technicianRole), UserStatus.ACTIVE));
        
        // Cleaner Users
        users.add(createUser("cleaner1", "cleaner1@apartment.com", "0901234579", "Clara Cleaner", 
            LocalDate.of(1989, 1, 20), "123456789019", Set.of(cleanerRole), UserStatus.ACTIVE));
        
        users.add(createUser("cleaner2", "cleaner2@apartment.com", "0901234580", "Chris Cleaner", 
            LocalDate.of(1990, 6, 8), "123456789020", Set.of(cleanerRole), UserStatus.ACTIVE));
        
        // Security Users
        users.add(createUser("security1", "security1@apartment.com", "0901234581", "Sam Security", 
            LocalDate.of(1986, 12, 15), "123456789021", Set.of(securityRole), UserStatus.ACTIVE));
        
        users.add(createUser("security2", "security2@apartment.com", "0901234588", "Sophie Security", 
            LocalDate.of(1988, 3, 22), "123456789022", Set.of(securityRole), UserStatus.ACTIVE));
        
        // Special Status Users
        users.add(createUser("resident_locked", "locked@gmail.com", "0901234589", "Locke Resident", 
            LocalDate.of(1990, 1, 1), "999999999999", Set.of(residentRole), UserStatus.LOCKED, "Policy violation"));
        
        users.add(createUser("resident_inactive", "inactive@gmail.com", "0901234590", "Inactive Resident", 
            LocalDate.of(1991, 2, 2), "888888888888", Set.of(residentRole), UserStatus.INACTIVE));
        
        System.out.println("✅ Created " + users.size() + " users with complete information");
    }
    /**
     * PART 4.5: Initialize Water Meter Readings for apartments (monthly from 2025-01)
     */
    private void initializeWaterMeterReadings() {
        System.out.println("💧 Initializing Water Meter Readings...");

        List<Apartment> apartments = apartmentRepository.findAll();
        // Use admin as recorder
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        Long recordedBy = adminOpt.map(User::getId).orElse(1L);

        YearMonth start = YearMonth.of(2025, 1);
        YearMonth end = YearMonth.now();

        for (Apartment apartment : apartments) {
            YearMonth ym = start;
            double previousMeter = 100.0 + (apartment.getId() % 50); // base per apartment
            while (!ym.isAfter(end)) {
                LocalDate readingDate = LocalDate.of(ym.getYear(), ym.getMonthValue(), Math.min(ym.lengthOfMonth(), 28));
                // If exists, skip
                boolean exists = waterMeterReadingRepository
                    .findByApartmentIdAndReadingDate(apartment.getId(), readingDate)
                    .isPresent();
                if (!exists) {
                    // Vary consumption by area and month
                    double consumption = Math.max(3.0, (apartment.getArea() / 30.0) + (ym.getMonthValue() % 4));
                    double unitPrice = 10000.0 + ((apartment.getId() % 3) * 500); // VND per m3
                    double total = consumption * unitPrice;
                    previousMeter += consumption;

                    WaterMeterReading reading = new WaterMeterReading();
                    reading.setApartmentId(apartment.getId());
                    reading.setReadingDate(readingDate);
                    reading.setMeterReading(BigDecimal.valueOf(previousMeter));
                    reading.setConsumption(BigDecimal.valueOf(consumption));
                    reading.setUnitPrice(BigDecimal.valueOf(unitPrice));
                    reading.setTotalAmount(BigDecimal.valueOf(total));
                    reading.setRecordedBy(recordedBy);
                    waterMeterReadingRepository.save(reading);
                }
                ym = ym.plusMonths(1);
            }
        }

        System.out.println("✅ Water meter readings initialized");
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
            .buildingName("Tower A - Golden Tower")
            .address("123 ABC Street, Ward 1, District 1, Ho Chi Minh City")
            .floors(25)
            .description("Premium tower with full amenities and river view")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tower B - Silver Residence")
            .address("456 XYZ Street, Ward 2, District 2, Ho Chi Minh City")
            .floors(20)
            .description("Mid-range building for families, near schools and hospitals")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tower C - Diamond Complex")
            .address("789 DEF Street, Ward 3, District 3, Ho Chi Minh City")
            .floors(30)
            .description("High-end building with full amenities, 24/7 security")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tower D - Emerald Garden")
            .address("321 GHI Street, Ward 4, District 7, Ho Chi Minh City")
            .floors(18)
            .description("Green space, suitable for families with children")
            .build()));
        
        buildings.add(buildingRepository.save(Building.builder()
            .buildingName("Tower E - Platinum Heights")
            .address("654 JKL Street, Ward 5, District 4, Ho Chi Minh City")
            .floors(22)
            .description("Luxury building with sea view and premium amenities")
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
        
        // 2.3 Create vehicle capacity configurations for each building
        System.out.println("🚗 Creating vehicle capacity configurations...");
        List<VehicleCapacityConfig> vehicleCapacityConfigs = new ArrayList<>();
        
        for (Building building : buildings) {
            VehicleCapacityConfig config = VehicleCapacityConfig.builder()
                .buildingId(building.getId())
                .maxCars(50) // Giới hạn 50 ô tô
                .maxMotorcycles(100) // Giới hạn 100 xe máy
                .isActive(true)
                .build();
            
            vehicleCapacityConfigs.add(vehicleCapacityConfigRepository.save(config));
        }
        
        System.out.println("✅ Created " + vehicleCapacityConfigs.size() + " vehicle capacity configurations");
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
            .name("Premium Gym")
            .description("Modern gym with full equipment and personal trainers")
            .location("Ground Floor - Gym")
            .capacity(30)
            .capacityType("INDIVIDUAL")
            .groupSize(null)
            .otherDetails("Open 06:00-22:00, lockers and showers available")
            .usageFee(80000.0)
            .openingHours("06:00 - 22:00")
            .isVisible(true)
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Olympic Pool")
            .description("Outdoor pool with great view and professional lifeguards")
            .location("Ground Floor - Pool")
            .capacity(50)
            .capacityType("INDIVIDUAL")
            .groupSize(null)
            .otherDetails("Open 06:00-21:00, sun loungers and pool bar")
            .usageFee(120000.0)
            .openingHours("06:00 - 21:00")
            .isVisible(true)
            .build()));
        
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Basketball Court")
            .description("Outdoor basketball court with lighting")
            .location("Ground Floor - Basketball Court")
            .capacity(20)
            .capacityType("GROUP")
            .groupSize(10)
            .otherDetails("Lighting and canopy, suitable for all ages")
            .usageFee(60000.0)
            .openingHours("06:00 - 22:00")
            .isVisible(true)
            .build()));
        
        // Community & Entertainment Facilities
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Community Room")
            .description("Multi-purpose room for community activities and parties")
            .location("Ground Floor - Community Hall")
            .capacity(100)
            .capacityType("GROUP")
            .groupSize(20)
            .otherDetails("Stage, audio and lighting, tables and chairs, pantry")
            .usageFee(30000.0)
            .openingHours("08:00 - 22:00")
            .isVisible(true)
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Meeting Room")
            .description("Multi-purpose meeting room with projector and audio")
            .location("Tower B - Floor 2")
            .capacity(40)
            .capacityType("GROUP")
            .groupSize(8)
            .otherDetails("Projector, audio, tables and chairs, free Wi-Fi")
            .usageFee(50000.0)
            .openingHours("08:00 - 20:00")
            .isVisible(true)
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Outdoor BBQ Area")
            .description("Outdoor BBQ area with a nice view")
            .location("Ground Floor - BBQ Area")
            .capacity(50)
            .capacityType("GROUP")
            .groupSize(15)
            .otherDetails("Benches, grills, gas stove, bar")
            .usageFee(80000.0)
            .openingHours("16:00 - 22:00")
            .isVisible(true)
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Kids Playground")
            .description("Safe playground for kids with various games")
            .location("Ground Floor - Playground")
            .capacity(20)
            .capacityType("INDIVIDUAL")
            .groupSize(null)
            .otherDetails("Toys, seating for parents, canopy")
            .usageFee(0.0)
            .openingHours("06:00 - 20:00")
            .isVisible(true)
            .build()));
        
        facilities.add(facilityRepository.save(Facility.builder()
            .name("Spa & Massage")
            .description("Relaxing spa and massage services for residents")
            .location("Tower B - Floor 1")
            .capacity(10)
            .capacityType("INDIVIDUAL")
            .groupSize(null)
            .otherDetails("Massage rooms, spa, sauna, professional staff")
            .usageFee(200000.0)
            .openingHours("09:00 - 21:00")
            .isVisible(true)
            .build()));
        
        
        
        // 4.2 Create Service Categories (only if they don't exist)
        List<ServiceCategory> serviceCategories = new ArrayList<>();
        
        // Create service categories only if they don't exist
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("ELECTRICITY")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("ELECTRICITY")
                .categoryName("Electricity")
                .assignedRole("TECHNICIAN")
                .description("Electrical repairs, bulbs, outlets, switches, panels")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("PLUMBING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("PLUMBING")
                .categoryName("Plumbing")
                .assignedRole("TECHNICIAN")
                .description("Pipes, faucets, toilets, sinks, water pumps")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("CLEANING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("CLEANING")
                .categoryName("Cleaning")
                .assignedRole("CLEANER")
                .description("Housekeeping, sweeping, general cleaning, garbage collection")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("SECURITY")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("SECURITY")
                .categoryName("Security")
                .assignedRole("SECURITY")
                .description("Patrols, security checks, incidents, access control")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("HVAC")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("HVAC")
                .categoryName("HVAC")
                .assignedRole("TECHNICIAN")
                .description("Maintenance and repair for air conditioning and ventilation")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("ELEVATOR")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("ELEVATOR")
                .categoryName("Elevator")
                .assignedRole("TECHNICIAN")
                .description("Elevator maintenance, repair and safety checks")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("GARDENING")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("GARDENING")
                .categoryName("Gardening")
                .assignedRole("CLEANER")
                .description("Plant care, trimming, watering, fertilizing")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("INTERNET")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("INTERNET")
                .categoryName("Internet & IT")
                .assignedRole("TECHNICIAN")
                .description("Internet network, Wi‑Fi, cameras and IT systems")
                .build())));
        
        serviceCategories.add(serviceCategoryRepository.findByCategoryCode("GENERAL")
            .orElseGet(() -> serviceCategoryRepository.save(ServiceCategory.builder()
                .categoryCode("GENERAL")
                .categoryName("Other")
                .assignedRole("STAFF")
                .description("Other requests that do not fit the categories above")
                .build())));
        
        System.out.println("✅ Created " + facilities.size() + " facilities and " + serviceCategories.size() + " service categories");
    }

    /**
     * Seed service fee configs for 9 recent months to simulate a live project.
     */
    private void initializeServiceFeeConfigsForNineMonths() {
        System.out.println("🧾 Initializing Service Fee Configs for last 9 months...");
        YearMonth current = YearMonth.now();
        for (int i = 8; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            boolean exists = serviceFeeConfigRepository.findByMonthAndYear(ym.getMonthValue(), ym.getYear()).isPresent();
            if (!exists) {
                // Slight variations per month
                double servicePerM2 = 12000.0 + (i * 50);
                double waterPerM3 = 10000.0 + (i * 30);
                double moto = 60000.0 + (i * 100);
                double car4 = 200000.0 + (i * 500);
                double car7 = 250000.0 + (i * 700);

                serviceFeeConfigRepository.save(ServiceFeeConfig.builder()
                    .month(ym.getMonthValue())
                    .year(ym.getYear())
                    .serviceFeePerM2(servicePerM2)
                    .waterFeePerM3(waterPerM3)
                    .motorcycleFee(moto)
                    .car4SeatsFee(car4)
                    .car7SeatsFee(car7)
                    .build());
            }
        }
        System.out.println("✅ Service Fee Configs initialized for 9 months");
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
            .title("Elevator maintenance - Tower A")
            .content("Elevators in Tower A will undergo scheduled maintenance from 08:00 to 12:00 on 2025-12-15. Please use other elevators during this time. We apologize for the inconvenience.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Service fee for December 2025")
            .content("The service fee for December 2025 will increase by 5% due to rising utility costs. Please pay on time to avoid late fees. See details in the invoice section.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Cleaning service schedule")
            .content("Cleaning services will be performed every Monday and Friday. Please dispose of trash properly and do not leave garbage in the hallways.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        // Urgent Announcements
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("URGENT: Planned power outage")
            .content("There will be a planned power maintenance from 22:00 to 06:00 on 2025-12-20. Please prepare flashlights and necessary equipment. Power will be restored as soon as possible.")
            .type("URGENT")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("URGENT: Security notice")
            .content("Please lock doors carefully and do not let strangers into the building. Report suspicious activities immediately. Security hotline: 0901234567")
            .type("URGENT")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        // Event Announcements
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("New Year 2025 Celebration")
            .content("The New Year 2025 celebration will take place in the main lobby from 18:00 to 22:00 on 2025-12-30. Lion dance, traditional cuisine, and fun activities. All residents are welcome!")
            .type("EVENT")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Internet service upgrade")
            .content("Internet service will be upgraded on 2025-12-28. There may be interruptions from 02:00 to 04:00. Speeds will be significantly improved afterward.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        announcements.add(announcementRepository.save(Announcement.builder()
            .title("Water system maintenance")
            .content("The water system will undergo maintenance from 14:00 to 18:00 on 2025-12-25. Please store enough water for this period. Service will be restored as soon as possible.")
            .type("REGULAR")
            .targetAudience("ALL")
            .createdBy(adminUser.getId())
            .isActive(true)
            .build()));
        
        // 5.2 Create Diverse Events
        List<Event> events = new ArrayList<>();
        
        events.add(eventRepository.save(Event.builder()
            .title("Christmas 2025 Gala Dinner")
            .description("Elegant Christmas party for residents with fun activities, diverse cuisine and performances")
            .startTime(LocalDateTime.of(2025, 12, 24, 18, 0))
            .endTime(LocalDateTime.of(2025, 12, 24, 22, 0))
            .location("Main lobby - Tower A - Golden Tower")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Monthly resident meeting - December 2025")
            .description("Regular meeting to discuss common issues, improvement plans and gather feedback")
            .startTime(LocalDateTime.of(2025, 12, 15, 19, 0))
            .endTime(LocalDateTime.of(2025, 12, 15, 21, 0))
            .location("Community Room")
            .build()));
        events.add(eventRepository.save(Event.builder()
            .title("Monthly resident meeting - August 2025")
            .description("Regular meeting to discuss common issues, improvement plans and gather feedback")
            .startTime(LocalDateTime.of(2025, 8, 15, 19, 0))
            .endTime(LocalDateTime.of(2025, 8, 15, 21, 0))
            .location("Community Room")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Free yoga class - Sunday morning")
            .description("Free yoga class for residents every Sunday morning, suitable for all ages, with professional instructors")
            .startTime(LocalDateTime.of(2025, 12, 22, 7, 0))
            .endTime(LocalDateTime.of(2025, 12, 22, 8, 30))
            .location("Gym room - Floor 2")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Traditional Vietnamese cooking workshop")
            .description("Cooking workshop with signature Vietnamese dishes guided by professional chefs")
            .startTime(LocalDateTime.of(2025, 12, 28, 14, 0))
            .endTime(LocalDateTime.of(2025, 12, 28, 17, 0))
            .location("Outdoor BBQ Area")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Resident Tennis Open 2025 - New season")
            .description("Annual tennis tournament for residents with multiple categories and attractive prizes")
            .startTime(LocalDateTime.of(2025, 7, 1, 8, 0))
            .endTime(LocalDateTime.of(2025, 12, 31, 18, 0))
            .location("Tennis Court")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Asian cuisine cooking class")
            .description("Cooking class with dishes from Japan, Korea, Thailand and China")
            .startTime(LocalDateTime.of(2025, 1, 15, 14, 0))
            .endTime(LocalDateTime.of(2025, 1, 15, 17, 0))
            .location("Community Room")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Monthly resident meeting 01/2025 - New year plan")
            .description("Regular meeting to discuss the new year plan, service improvements and gather feedback")
            .startTime(LocalDateTime.of(2025, 1, 15, 19, 0))
            .endTime(LocalDateTime.of(2025, 1, 15, 21, 0))
            .location("Meeting Room")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("New Year 2025 - Countdown Party")
            .description("New Year 2025 party with countdown, lively music and fun activities")
            .startTime(LocalDateTime.of(2025, 1, 1, 18, 0))
            .endTime(LocalDateTime.of(2025, 1, 1, 23, 0))
            .location("Main lobby - Tower A - Golden Tower")
            .build()));
        
        events.add(eventRepository.save(Event.builder()
            .title("Security workshop - 3-day seminar")
            .description("Security workshop for residents with experts, taking place over three consecutive days")
            .startTime(LocalDateTime.of(2025, 2, 10, 9, 0))
            .endTime(LocalDateTime.of(2025, 2, 12, 17, 0))
            .location("Meeting Room - Floor 1")
            .build()));
        
        // Mark some announcements as read by random residents to mimic 9-month activity
        List<User> residents = userRepository.findAllWithRoles().stream()
            .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> "RESIDENT".equals(r.getName())))
            .toList();
        int reads = 0;
        for (Announcement ann : announcements) {
            for (int i = 0; i < residents.size(); i += 3) { // every 3rd resident reads
                announcementReadRepository.save(AnnouncementRead.builder()
                    .announcement(ann)
                    .user(residents.get(i))
                    .build());
                reads++;
            }
        }
        System.out.println("✅ Created " + announcements.size() + " announcements, " + events.size() + " events and " + reads + " announcement reads");
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
        String[] purposes = {
            "Morning workout",
            "Family swimming",
            "Tennis practice",
            "Basketball game",
            "Community meetup",
            "Team meeting",
            "BBQ gathering",
            "Kids playtime",
            "Spa relaxation"
        };
        
        // Past bookings (completed)
        for (int i = 0; i < Math.min(10, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get(i % facilities.size());
            
            // Past booking - completed
            LocalDateTime start = LocalDateTime.now().minusDays(7 + i);
            int duration = 60;
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(start)
                .endTime(start.plusMinutes(duration))
                .duration(duration)
                .status(FacilityBookingStatus.CONFIRMED)
                .numberOfPeople(2 + (i % 4))
                .purpose(purposes[i % purposes.length])
                .build()));
            
            // Past booking - rejected
            if (i % 3 == 0) {
                LocalDateTime start2 = LocalDateTime.now().minusDays(5 + i);
                int duration2 = 90;
                bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                    .facility(facility)
                    .user(resident)
                    .bookingTime(start2)
                    .endTime(start2.plusMinutes(duration2))
                    .duration(duration2)
                    .status(FacilityBookingStatus.REJECTED)
                    .numberOfPeople(3 + (i % 3))
                    .purpose(purposes[(i + 1) % purposes.length])
                    .build()));
            }
        }
        
        // Current bookings (pending/confirmed)
        for (int i = 0; i < Math.min(15, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get((i + 1) % facilities.size());
            
            // Current booking - pending
            LocalDateTime start = LocalDateTime.now().plusDays(1 + i);
            int duration = 120;
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(start)
                .endTime(start.plusMinutes(duration))
                .duration(duration)
                .status(FacilityBookingStatus.PENDING)
                .numberOfPeople(4 + (i % 3))
                .purpose(purposes[(i + 2) % purposes.length])
                .build()));
            
            // Current booking - confirmed
            if (i % 2 == 0) {
                LocalDateTime start2 = LocalDateTime.now().plusDays(2 + i);
                int duration2 = 180;
                bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                    .facility(facility)
                    .user(resident)
                    .bookingTime(start2)
                    .endTime(start2.plusMinutes(duration2))
                    .duration(duration2)
                    .status(FacilityBookingStatus.CONFIRMED)
                    .numberOfPeople(6 + (i % 4))
                    .purpose(purposes[(i + 3) % purposes.length])
                    .build()));
            }
        }
        
        // Future bookings (upcoming)
        for (int i = 0; i < Math.min(20, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get((i + 2) % facilities.size());
            
            // Future booking - confirmed
            LocalDateTime start = LocalDateTime.now().plusDays(7 + i);
            int duration = 240;
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(start)
                .endTime(start.plusMinutes(duration))
                .duration(duration)
                .status(FacilityBookingStatus.CONFIRMED)
                .numberOfPeople(8 + (i % 5))
                .purpose(purposes[(i + 4) % purposes.length])
                .build()));
            
            // Future booking - pending
            if (i % 3 == 0) {
                LocalDateTime start2 = LocalDateTime.now().plusDays(10 + i);
                int duration2 = 300;
                bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                    .facility(facility)
                    .user(resident)
                    .bookingTime(start2)
                    .endTime(start2.plusMinutes(duration2))
                    .duration(duration2)
                    .status(FacilityBookingStatus.PENDING)
                    .numberOfPeople(10 + (i % 6))
                    .purpose(purposes[(i + 5) % purposes.length])
                    .build()));
            }
        }
        
        // Special bookings (large groups, special events)
        for (int i = 0; i < Math.min(5, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get(0); // Community room for large events
            
            // Large group booking
            LocalDateTime start = LocalDateTime.now().plusDays(15 + i);
            int duration = 480; // 8 hours
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(start)
                .endTime(start.plusMinutes(duration))
                .duration(duration)
                .status(FacilityBookingStatus.CONFIRMED)
                .numberOfPeople(20 + (i * 5))
                .purpose("Large group event")
                .build()));
        }
        
        // Rejected bookings
        for (int i = 0; i < Math.min(8, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            Facility facility = facilities.get((i + 3) % facilities.size());
            
            LocalDateTime start = LocalDateTime.now().plusDays(3 + i);
            int duration = 60;
            bookings.add(facilityBookingRepository.save(FacilityBooking.builder()
                .facility(facility)
                .user(resident)
                .bookingTime(start)
                .endTime(start.plusMinutes(duration))
                .duration(duration)
                .status(FacilityBookingStatus.REJECTED)
                .numberOfPeople(2)
                .purpose("Booking rejected")
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

        // Generate billing periods from 2025-01 up to current month
        YearMonth start = YearMonth.of(2025, 1);
        YearMonth end = YearMonth.now();

        for (Apartment apartment : apartmentsWithResidents) {
            YearMonth ym = start;
            int idx = 0;
            while (!ym.isAfter(end)) {
                String period = ym.toString(); // format YYYY-MM
                boolean hasInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartment.getId(), period).isPresent();

                if (!hasInvoice) {
                    // Rotate statuses: UNPAID, PAID, OVERDUE, PAID, PAID
                    InvoiceStatus status;
                    int mod = idx % 5;
                    if (mod == 0) status = InvoiceStatus.UNPAID;
                    else if (mod == 2) status = InvoiceStatus.OVERDUE;
                    else status = InvoiceStatus.PAID;

                    double baseAmount = 800000.0 + (apartment.getArea() * 1000) + (idx * 20000);
                    double paidAmount = status == InvoiceStatus.PAID ? baseAmount : (status == InvoiceStatus.OVERDUE ? baseAmount * 0.7 : 0);

                    Invoice invoice = invoiceRepository.save(Invoice.builder()
                        .apartmentId(apartment.getId())
                        .billingPeriod(period)
                        .issueDate(LocalDate.of(ym.getYear(), ym.getMonthValue(), 1))
                        .dueDate(LocalDate.of(ym.getYear(), ym.getMonthValue(), Math.min(15, ym.lengthOfMonth())))
                        .totalAmount(baseAmount)
                        .status(status)
                        .build());

                    invoices.add(invoice);
                    createInvoiceItems(invoice, apartment.getArea());
                }

                ym = ym.plusMonths(1);
                idx++;
            }
        }
        
        // 7.3 Create Payment Records for paid invoices
        List<Payment> payments = new ArrayList<>();
        
        for (Invoice invoice : invoices) {
            if (invoice.getStatus() == InvoiceStatus.PAID) {
                Payment payment = paymentRepository.save(Payment.builder()
                    .invoice(invoice)
                    .paidByUserId(invoice.getApartmentId())
                    .amount(invoice.getTotalAmount())
                    .method(PaymentMethod.BANK_TRANSFER)
                    .status(PaymentStatus.PAID)
                    .referenceCode("PAY" + invoice.getBillingPeriod().replace("-", "") + invoice.getApartmentId())
                    .build());

                payments.add(payment);
            }
        }
        
        // Create synthetic payment transactions for paid invoices to enrich dataset
        int txCount = 0;
        for (Payment p : payments) {
            PaymentTransaction tx = new PaymentTransaction();
            tx.setTransactionRef("TX-" + p.getReferenceCode());
            tx.setInvoiceId(p.getInvoice().getId());
            tx.setAmount(p.getAmount().longValue());
            tx.setGateway("VNPAY");
            tx.setOrderInfo("Invoice payment for period " + p.getInvoice().getBillingPeriod());
            tx.setPaidByUserId(p.getPaidByUserId());
            tx.setStatus(PaymentTransaction.STATUS_SUCCESS);
            tx.setCreatedAt(LocalDateTime.now().minusDays(1));
            tx.setUpdatedAt(LocalDateTime.now());
            tx.setCompletedAt(LocalDateTime.now());
            paymentTransactionRepository.save(tx);
            txCount++;
        }

        System.out.println("✅ Created " + invoices.size() + " invoices, " + payments.size() + " payments and " + txCount + " payment transactions");
    }
    
    /**
     * Helper method to create invoice items
     */
    private void createInvoiceItems(Invoice invoice, double apartmentArea) {
        // Determine month for fetching water reading
        YearMonth ym = YearMonth.parse(invoice.getBillingPeriod());

        // Electricity (estimate by area)
        double electricity = 200000.0 + (apartmentArea * 60);
        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("ELECTRICITY")
            .description("Electricity usage")
            .amount(electricity)
            .build());

        // Water (from water_meter_readings)
        double waterAmount = 0.0;
        LocalDate monthStart = LocalDate.of(ym.getYear(), ym.getMonthValue(), 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        List<WaterMeterReading> readingsInMonth = waterMeterReadingRepository.findAllByReadingDateBetween(monthStart, monthEnd);
        Optional<WaterMeterReading> wm = readingsInMonth.stream()
            .filter(r -> r.getApartmentId().equals(invoice.getApartmentId()))
            .findFirst();
        if (wm.isPresent()) {
            waterAmount = wm.get().getTotalAmount().doubleValue();
        } else {
            // fallback: small estimate
            waterAmount = 150000.0 + (apartmentArea * 20);
        }
        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("WATER")
            .description("Water consumption")
            .amount(waterAmount)
            .build());

        // Parking (flat or based on area proxy)
        double parking = 100000.0 + ((apartmentArea > 80) ? 50000.0 : 0.0);
        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("PARKING")
            .description("Monthly parking fee")
            .amount(parking)
            .build());

        // Internet
        double internet = 120000.0;
        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("INTERNET")
            .description("Internet and TV package")
            .amount(internet)
            .build());

        // Common fees
        double maintenance = 250000.0 + (apartmentArea * 10);
        double cleaning = 150000.0;
        double security = 100000.0;
        double gardening = 80000.0;

        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("MAINTENANCE")
            .description("Common maintenance fee")
            .amount(maintenance)
            .build());

        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("CLEANING")
            .description("Common cleaning fee")
            .amount(cleaning)
            .build());

        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("SECURITY")
            .description("Security service fee")
            .amount(security)
            .build());

        invoiceItemRepository.save(InvoiceItem.builder()
            .invoice(invoice)
            .feeType("GARDENING")
            .description("Gardening care fee")
            .amount(gardening)
            .build());

        // Update invoice total to sum of items
        double total = electricity + waterAmount + parking + internet + maintenance + cleaning + security + gardening;
        invoice.setTotalAmount(total);
        invoiceRepository.save(invoice);
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
            "Air conditioner not working",
            "Replace burnt hallway light",
            "Fix leaking faucet",
            "Clean common yard trash",
            "Inspect electrical system",
            "Repair malfunctioning elevator",
            "Maintain water system",
            "Clean common area",
            "Fix automatic door",
            "Check security cameras",
            "Trim greenery",
            "Fix unstable Wi‑Fi",
            "Replace broken door lock",
            "Repair water pump",
            "Clean and reorganize parking area"
        };
        
        String[] requestDescriptions = {
            "The living room AC is not cooling. Please inspect and repair urgently.",
            "The hallway light on floor 5 is burnt. Please replace for safety.",
            "The kitchen faucet is leaking. Please repair to avoid water waste.",
            "Trash is piling up in the common yard. Please clean to maintain hygiene.",
            "Electrical system shows anomalies. Please inspect for safety.",
            "Elevator in Tower A is malfunctioning. Please repair for residents.",
            "Water system has issues. Please perform periodic maintenance.",
            "Common area needs thorough cleaning.",
            "Automatic entrance door is broken. Please repair.",
            "Security cameras are not working. Please check and fix.",
            "Greenery needs trimming to maintain aesthetics.",
            "Wi‑Fi is unstable. Please inspect and fix.",
            "Main door lock is broken. Please replace for safety.",
            "Water pump is faulty. Please repair to ensure supply.",
            "Parking area needs cleaning and reorganization."
        };
        
        // Create service requests with different statuses
        for (int i = 0; i < Math.min(20, residentUsers.size()); i++) {
            User resident = residentUsers.get(i % residentUsers.size());
            ServiceCategory category = serviceCategories.get(i % serviceCategories.size());
            User assignedStaff = staffUsers.isEmpty() ? null : staffUsers.get(i % staffUsers.size());
            
            // Determine status based on index
            ServiceRequestStatus status;
            if (i < 5) status = ServiceRequestStatus.PENDING;
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
                .resolutionNotes(status == ServiceRequestStatus.COMPLETED ? "Completed as requested" : null)
                .completedAt(status == ServiceRequestStatus.COMPLETED ? LocalDateTime.now().minusDays(5 - i) : null)
                .rating(status == ServiceRequestStatus.COMPLETED ? 4 + (i % 2) : null)
                .build());
            
            serviceRequests.add(request);
        }
        
        // 8.2 Create Feedback Categories and Feedback
        List<FeedbackCategory> feedbackCategories = new ArrayList<>();
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("GENERAL_SERVICE")
            .categoryName("General services")
            .description("Feedback about general building services")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("SECURITY")
            .categoryName("Security")
            .description("Feedback about security and guard services")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("CLEANING")
            .categoryName("Cleaning")
            .description("Feedback about cleaning and housekeeping services")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("FACILITIES")
            .categoryName("Facilities")
            .description("Feedback about facilities and infrastructure")
            .build()));
        
        feedbackCategories.add(feedbackCategoryRepository.save(FeedbackCategory.builder()
            .categoryCode("MANAGEMENT")
            .categoryName("Management")
            .description("Feedback about management and support services")
            .build()));
        
        // 8.3 Create Diverse Feedback
        List<Feedback> feedbacks = new ArrayList<>();
        
        String[] feedbackContents = {
            "Cleaning service is excellent; staff are professional.",
            "Security system needs improvement; cameras are problematic.",
            "Gym facility is great; equipment is modern and clean.",
            "Management responds slowly; response time should improve.",
            "Common areas should be cleaned more frequently.",
            "Internet service is stable with good speed.",
            "Security staff work very well; residents feel safe.",
            "More facilities for children are needed.",
            "Elevator system operates well.",
            "Notification system should be improved."
        };
        
        String[] responses = {
            "Thank you for the positive feedback. We'll maintain service quality.",
            "We have acknowledged the issue and will fix it as soon as possible.",
            "Glad that you are satisfied. We will keep improving.",
            "Apologies for the inconvenience. We will improve response times.",
            "We will increase cleaning frequency in common areas.",
            "Thank you for the positive feedback on internet service.",
            "Thank you for recognizing our security team.",
            "We are planning to add more facilities for children.",
            "Thank you for the positive feedback on the elevator system.",
            "We will improve the notification system."
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
            "Logged into the system",
            "Viewed new announcements",
            "Booked gym facility",
            "Paid December invoice",
            "Reported AC issue",
            "Registered for Christmas event",
            "Updated profile information",
            "Viewed payment history",
            "Booked pool facility",
            "Submitted service feedback",
            "Viewed apartment information",
            "Downloaded invoice",
            "Scheduled appointment with manager",
            "Viewed maintenance notice",
            "Subscribed to notifications"
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
            "How to book the gym facility?",
            "What is this month's service fee?",
            "How to pay invoices online?",
            "What are the pool opening hours?",
            "How to report a service issue?",
            "Can I register for events?",
            "How to update my personal information?",
            "When is the general cleaning schedule?",
            "Information about security policies?",
            "How to contact the building manager?"
        };
        
        String[] answers = {
            "You can book the gym via app or website: Facilities -> Book -> Choose gym and time.",
            "This month's fee includes: Electricity, Water, Cleaning, Security. See invoices for details.",
            "You can pay online via bank transfer, e-wallets (MoMo, ZaloPay) or credit card.",
            "The pool is open daily from 06:00 to 21:00 with professional lifeguards.",
            "Report issues via hotline 0901234567, submit a request in the app, or contact management.",
            "Yes. Go to Events -> select an event -> Register.",
            "Profile -> Edit -> Update information -> Save.",
            "General cleaning: Monday and Friday, 08:00–12:00. Please dispose of trash properly.",
            "24/7 security with CCTV, patrols and automatic doors. Report suspicious behavior immediately.",
            "Contact manager: Hotline 0901234567, Email: manager@apartment.com, Office: Floor 1, Tower A."
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
            "30A-12345", "30A-67890", "29B-11223", "31C-33445", "51D-55667",
            "30B-12350", "59A-77889", "50B-99001", "18C-22334", "20D-44556",
            "30C-12355", "37A-66778", "88B-88990", "14C-10101", "72D-12121",
            "30D-12360", "43A-23232", "47B-34343", "60C-45454", "65D-56565"
        };
        
        String[] brands = {"Toyota", "Honda", "Ford", "Hyundai", "Kia", "Mazda", "Nissan", "BMW", "Mercedes", "Audi"};
        String[] models = {"Vios", "City", "Ranger", "Accent", "Rio", "Mazda 3", "Sunny", "X3", "C-Class", "A4"};
        String[] colors = {"White", "Black", "Silver", "Blue", "Red", "Gray", "Yellow", "Orange", "Purple", "Brown"};
        
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
            "John Father", "Mary Mother", "Andrew Brother", "Sophie Sister", "Ethan Younger",
            "Linda Wife", "Victor Husband", "Bella Child", "Nathan Friend", "Lucy Neighbor"
        };
        
        String[] relationships = {
            "Father", "Mother", "Brother", "Sister", "Younger brother",
            "Wife", "Husband", "Child", "Friend", "Neighbor"
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
        
        // 11.1b Seed Email Verification Tokens and Refresh Tokens (idempotent-ish)
        int tokenCount = 0;
        for (int i = 0; i < Math.min(10, residentUsers.size()); i++) {
            User resident = residentUsers.get(i);
            // Email token
            EmailVerificationToken evt = EmailVerificationToken.builder()
                .token("EVT-" + resident.getId() + "-" + System.currentTimeMillis())
                .user(resident)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();
            emailVerificationTokenRepository.save(evt);
            // Refresh token
            RefreshToken rt = RefreshToken.builder()
                .user(resident)
                .token("RT-" + resident.getId() + "-" + System.nanoTime())
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build();
            refreshTokenRepository.save(rt);
            tokenCount += 2;
        }
        
        // 11.1c Seed Apartment Invitations for first few apartments
        List<Apartment> someApartments = apartmentRepository.findAll();
        int inviteCount = 0;
        for (int i = 0; i < Math.min(10, someApartments.size()); i++) {
            ApartmentInvitation inv = ApartmentInvitation.builder()
                .code("INV-" + someApartments.get(i).getId() + "-" + (1000 + i))
                .apartmentId(someApartments.get(i).getId())
                .used(false)
                .expiresAt(LocalDateTime.now().plusDays(14))
                .build();
            apartmentInvitationRepository.save(inv);
            inviteCount++;
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
                    .checkedIn(false)
                    .build());
                
                eventRegistrations.add(registration);
            }
        }
        
        System.out.println("✅ Created " + emergencyContacts.size() + " emergency contacts, " + inviteCount + " invitations and " + tokenCount + " tokens");
        System.out.println("✅ Also created " + eventRegistrations.size() + " event registrations");
        
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