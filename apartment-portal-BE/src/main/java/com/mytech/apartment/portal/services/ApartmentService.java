package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.mappers.ApartmentMapper;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import com.mytech.apartment.portal.models.enums.RelationType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Cacheable(value = "apartments", key = "'all'")
    public List<ApartmentDto> getAllApartments() {
        return apartmentRepository.findAll().stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "apartments", key = "#id")
    public Optional<ApartmentDto> getApartmentById(Long id) {
        return apartmentRepository.findById(id)
                .map(apartmentMapper::toDto);
    }

    @Transactional
    @CachePut(value = "apartments", key = "#id")
    @CacheEvict(value = "apartments", key = "'all'")
    public ApartmentDto updateApartment(Long id, ApartmentUpdateRequest request) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found with id " + id));

        apartmentMapper.updateEntityFromRequest(apartment, request);
        Apartment updatedApartment = apartmentRepository.save(apartment);
        return apartmentMapper.toDto(updatedApartment);
    }

    @Transactional
    public void linkResidentToApartment(Long apartmentId, ApartmentResidentLinkRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại"));

        if (request.getUserId() == null) {
            throw new RuntimeException("UserId không được để trống");
        }

        ApartmentResidentId id = new ApartmentResidentId(apartmentId, request.getUserId());
        if (apartmentResidentRepository.findById(id).isPresent()) {
            throw new RuntimeException("User đã được liên kết với căn hộ này");
        }

        ApartmentResident apartmentResident = ApartmentResident.builder()
                .id(id)
                .relationType(RelationType.fromValue(request.getRelationType()))
                .moveInDate(request.getMoveInDate() != null ? request.getMoveInDate() : LocalDate.now())
                .moveOutDate(request.getMoveOutDate())
                .build();

        apartmentResidentRepository.save(apartmentResident);

        if (ApartmentStatus.VACANT.equals(apartment.getStatus())) {
            apartment.setStatus(ApartmentStatus.OCCUPIED);
            apartmentRepository.save(apartment);
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
     * Create new apartment with automatic water meter initialization
     * Tạo căn hộ mới với tự động khởi tạo chỉ số nước
     */
    @Transactional
    @CacheEvict(value = "apartments", key = "'all'")
    public ApartmentDto createApartment(ApartmentCreateRequest request) {
        
        // Tạo apartment entity
        Apartment apartment = Apartment.builder()
                .buildingId(request.getBuildingId())
                .floorNumber(request.getFloorNumber())
                .unitNumber(request.getUnitNumber())
                .area(request.getArea())
                .status(request.getStatus() != null ? 
                       ApartmentStatus.valueOf(request.getStatus()) : 
                       ApartmentStatus.VACANT)
                .build();
        
        // Save apartment
        Apartment savedApartment = apartmentRepository.save(apartment);
        
        // Tự động khởi tạo chỉ số nước cho tháng hiện tại
        initializeWaterMeterForApartment(savedApartment.getId().intValue());
        
        return apartmentMapper.toDto(savedApartment);
    }

    /**
     * Initialize water meter reading for new apartment
     * Khởi tạo chỉ số nước cho căn hộ mới
     */
    @Transactional
    public void initializeWaterMeterForApartment(Integer apartmentId) {
        String currentMonth = YearMonth.now().toString(); // "yyyy-MM"
        
        // Kiểm tra xem đã có chỉ số nước cho tháng hiện tại chưa
        Optional<WaterMeterReading> existing = waterMeterReadingRepository
                .findByApartmentIdAndReadingMonth(apartmentId, currentMonth);
        
        if (existing.isEmpty()) {
            WaterMeterReading waterMeterReading = new WaterMeterReading();
            waterMeterReading.setApartmentId(apartmentId);
            waterMeterReading.setReadingMonth(currentMonth);
            waterMeterReading.setPreviousReading(BigDecimal.ZERO);
            waterMeterReading.setCurrentReading(BigDecimal.ZERO);
            waterMeterReading.setCreatedAt(LocalDateTime.now());
            // consumption sẽ tự tính qua @PrePersist
            
            waterMeterReadingRepository.save(waterMeterReading);
            System.out.println("DEBUG: Đã khởi tạo chỉ số nước = 0 cho căn hộ " + apartmentId + " tháng " + currentMonth);
        }
    }

    /**
     * Initialize water meter readings for all apartments that don't have current month reading
     * Khởi tạo chỉ số nước cho tất cả căn hộ chưa có chỉ số tháng hiện tại
     */
    @Transactional
    public void initializeWaterMeterForAllApartments() {
        String currentMonth = YearMonth.now().toString();
        List<Apartment> apartments = apartmentRepository.findAll();
        
        int initializedCount = 0;
        for (Apartment apartment : apartments) {
            Optional<WaterMeterReading> existing = waterMeterReadingRepository
                    .findByApartmentIdAndReadingMonth(apartment.getId().intValue(), currentMonth);
            
            if (existing.isEmpty()) {
                initializeWaterMeterForApartment(apartment.getId().intValue());
                initializedCount++;
            }
        }
        
        System.out.println("DEBUG: Đã khởi tạo chỉ số nước cho " + initializedCount + " căn hộ cho tháng " + currentMonth);
    }

    /**
     * Get water meter readings by apartment ID
     * Lấy danh sách chỉ số nước theo ID căn hộ
     */
    public List<WaterMeterReadingDto> getWaterMetersByApartmentId(Long apartmentId) {
        List<WaterMeterReading> readings = waterMeterReadingRepository
                .findAllByApartmentIdOrderByReadingMonthDesc(apartmentId.intValue());
        
        return readings.stream().map(reading -> {
            WaterMeterReadingDto dto = new WaterMeterReadingDto();
            dto.setReadingId(reading.getReadingId());
            dto.setApartmentId(reading.getApartmentId());
            dto.setReadingMonth(reading.getReadingMonth());
            dto.setPreviousReading(reading.getPreviousReading());
            dto.setCurrentReading(reading.getCurrentReading());
            dto.setConsumption(reading.getConsumption());
            dto.setApartmentName(getApartmentName(reading.getApartmentId()));
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Lấy tên căn hộ theo ID, sử dụng cho WaterMeterService
     */
    public String getApartmentName(Integer apartmentId) {
        return apartmentRepository.findById(apartmentId.longValue())
                .map(Apartment::getUnitNumber)
                .orElse("Unknown apartment");
    }
}
