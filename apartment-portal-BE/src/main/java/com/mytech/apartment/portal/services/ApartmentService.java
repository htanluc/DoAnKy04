package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.mappers.ApartmentMapper;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import com.mytech.apartment.portal.models.enums.RelationType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.mappers.WaterMeterMapper;
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
public class ApartmentService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApartmentMapper apartmentMapper;

    @Autowired
    private ApartmentResidentMapper apartmentResidentMapper;

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private WaterMeterMapper waterMeterMapper;

    @Autowired
    @Lazy
    private WaterMeterService waterMeterService;

    private final Counter apartmentAccessCounter;
    private final Counter apartmentUpdateCounter;

    public ApartmentService(MeterRegistry meterRegistry) {
        this.apartmentAccessCounter = Counter.builder("apartment.access")
                .description("Number of apartment access operations")
                .register(meterRegistry);
        this.apartmentUpdateCounter = Counter.builder("apartment.update")
                .description("Number of apartment update operations")
                .register(meterRegistry);
    }

    @Timed(value = "apartment.get.all", description = "Time taken to get all apartments")
    @Cacheable(value = "apartments", key = "'all'")
    public List<ApartmentDto> getAllApartments() {
        apartmentAccessCounter.increment();
        return apartmentRepository.findAll().stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Timed(value = "apartment.get.by.id", description = "Time taken to get apartment by ID")
    @Cacheable(value = "apartments", key = "#id")
    public Optional<ApartmentDto> getApartmentById(Long id) {
        apartmentAccessCounter.increment();
        return apartmentRepository.findById(id)
                .map(apartmentMapper::toDto);
    }

    @Timed(value = "apartment.update", description = "Time taken to update apartment")
    @Transactional
    @CachePut(value = "apartments", key = "#id")
    @CacheEvict(value = "apartments", key = "'all'")
    public ApartmentDto updateApartment(Long id, ApartmentUpdateRequest request) {
        apartmentUpdateCounter.increment();
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found with id " + id));

        apartmentMapper.updateEntityFromRequest(apartment, request);
        Apartment updatedApartment = apartmentRepository.save(apartment);
        return apartmentMapper.toDto(updatedApartment);
    }

    @Transactional
    public void linkResidentToApartment(Long apartmentId, ApartmentResidentLinkRequest request) {
        try {
            System.out.println("🔗 Bắt đầu liên kết cư dân: apartmentId=" + apartmentId + ", userId=" + request.getUserId());
            
            // Kiểm tra apartment
            Apartment apartment = apartmentRepository.findById(apartmentId)
                    .orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại với ID: " + apartmentId));

            // Kiểm tra user
            if (request.getUserId() == null) {
                throw new RuntimeException("UserId không được để trống");
            }

            // Kiểm tra relationType
            if (request.getRelationType() == null || request.getRelationType().trim().isEmpty()) {
                throw new RuntimeException("Loại quan hệ không được để trống");
            }

            // Kiểm tra mối quan hệ đã tồn tại
            ApartmentResidentId id = new ApartmentResidentId(apartmentId, request.getUserId());
            if (apartmentResidentRepository.findById(id).isPresent()) {
                throw new RuntimeException("User đã được liên kết với căn hộ này");
            }

            // Validate và parse RelationType
            RelationType relationType;
            try {
                relationType = RelationType.fromValue(request.getRelationType());
                System.out.println("✅ RelationType hợp lệ: " + relationType);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Loại quan hệ không hợp lệ: '" + request.getRelationType() + 
                    "'. Các giá trị hợp lệ: " + Arrays.toString(RelationType.values()));
            }

            // Lấy user entity
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + request.getUserId()));
            
            // Debug: In ra thông tin user và apartment
            System.out.println("🔍 Debug User: ID=" + user.getId() + ", Username=" + user.getUsername());
            System.out.println("🔍 Debug Apartment: ID=" + apartment.getId() + ", UnitNumber=" + apartment.getUnitNumber());

            // Tạo ApartmentResident entity
            ApartmentResident apartmentResident = new ApartmentResident();
            
            // Khởi tạo id object
            ApartmentResidentId compositeId = new ApartmentResidentId();
            compositeId.setApartmentId(apartmentId);
            compositeId.setUserId(request.getUserId());
            apartmentResident.setId(compositeId);
            
            // Set các trường khác
            apartmentResident.setApartment(apartment);
            apartmentResident.setUser(user);
            apartmentResident.setRelationType(relationType);
            apartmentResident.setMoveInDate(request.getMoveInDate() != null ? request.getMoveInDate() : LocalDate.now());
            apartmentResident.setMoveOutDate(request.getMoveOutDate());
            apartmentResident.setIsPrimaryResident(false);
            apartmentResident.setCreatedAt(java.time.LocalDateTime.now());
            
            // Debug: In ra thông tin entity trước khi save
            System.out.println("🔍 Debug ApartmentResident entity:");
            System.out.println("🔍 ID: " + apartmentResident.getId());
            System.out.println("🔍 Apartment ID: " + apartmentResident.getId().getApartmentId());
            System.out.println("🔍 User ID: " + apartmentResident.getId().getUserId());
            System.out.println("🔍 Apartment: " + (apartmentResident.getApartment() != null ? apartmentResident.getApartment().getId() : "NULL"));
            System.out.println("🔍 User: " + (apartmentResident.getUser() != null ? apartmentResident.getUser().getId() : "NULL"));
            System.out.println("🔍 RelationType: " + apartmentResident.getRelationType());

            System.out.println("💾 Lưu ApartmentResident: " + apartmentResident);
            System.out.println("💾 ApartmentResident ID: " + apartmentResident.getId());
            System.out.println("💾 Apartment: " + apartmentResident.getApartment());
            System.out.println("💾 User: " + apartmentResident.getUser());
            
            ApartmentResident saved = apartmentResidentRepository.save(apartmentResident);
            System.out.println("✅ Đã lưu ApartmentResident với ID: " + saved.getId());

            // Cập nhật trạng thái căn hộ nếu cần
            if (ApartmentStatus.VACANT.equals(apartment.getStatus())) {
                apartment.setStatus(ApartmentStatus.OCCUPIED);
                apartmentRepository.save(apartment);
                System.out.println("🏠 Đã cập nhật trạng thái căn hộ thành OCCUPIED");
            }

            System.out.println("🎉 Liên kết cư dân thành công!");
            
        } catch (RuntimeException e) {
            System.err.println("❌ RuntimeException khi liên kết cư dân: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw để giữ nguyên message
        } catch (Exception e) {
            System.err.println("❌ Exception không xác định khi liên kết cư dân: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi không xác định khi liên kết cư dân: " + e.getMessage());
        }
    }

    public List<ApartmentResidentDto> getApartmentLinksOfUser(Long userId) {
        List<ApartmentResident> links = apartmentResidentRepository.findByUser_Id(userId);
        return links.stream()
            .map(apartmentResidentMapper::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void unlinkResidentFromApartment(Long apartmentId, Long userId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại"));

        ApartmentResidentId id = new ApartmentResidentId(apartmentId, userId);
        apartmentResidentRepository.deleteById(id);

        List<ApartmentResident> remainingLinks = apartmentResidentRepository.findByApartment_Id(apartmentId);
        if (remainingLinks.isEmpty()) {
            apartment.setStatus(ApartmentStatus.VACANT);
            apartmentRepository.save(apartment);
        }
    }

    public List<ApartmentResidentDto> getApartmentResidents(Long apartmentId) {
        if (!apartmentRepository.existsById(apartmentId)) {
            throw new RuntimeException("Căn hộ không tồn tại");
        }

        return apartmentResidentRepository.findByApartment_Id(apartmentId).stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ApartmentDto> getApartmentsByBuilding(Long buildingId) {
        return apartmentRepository.findByBuildingId(buildingId).stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ApartmentDto> getApartmentsByStatus(String status) {
        return apartmentRepository.findByStatus(ApartmentStatus.valueOf(status)).stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ApartmentDto> getApartmentsOfResident(Long userId) {
        List<ApartmentResident> links = apartmentResidentRepository.findByUser_Id(userId);
        return links.stream()
            .map(link -> link.getApartment()) // Sử dụng relationship trực tiếp
            .filter(Objects::nonNull)
            .map(apartmentMapper::toDto)
            .collect(Collectors.toList());
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(user -> user.getId())
            .orElse(null);
    }

    public Long getUserIdByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .map(user -> user.getId())
            .orElse(null);
    }

    /**
     * Lấy tên căn hộ theo ID, sử dụng cho WaterMeterService
     */
    public String getApartmentName(Integer apartmentId) {
        return apartmentRepository.findById(apartmentId.longValue())
                .map(Apartment::getUnitNumber)
                .orElse("Unknown apartment");
    }

    /**
     * Get water meter readings by apartment ID
     * Lấy danh sách chỉ số nước theo ID căn hộ
     */
    public List<WaterMeterReadingDto> getWaterMetersByApartmentId(Long apartmentId) {
        return waterMeterReadingRepository.findAllByApartmentIdOrderByReadingDateDesc(apartmentId).stream()
                .map(waterMeterMapper::toDto)
                .collect(Collectors.toList());
    }
}
