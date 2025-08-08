package com.mytech.apartment.portal.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mytech.apartment.portal.dtos.ApartmentResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.Building;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.RelationType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.BuildingRepository;
import com.mytech.apartment.portal.repositories.UserRepository;

@Service
@Transactional
public class ApartmentResidentService {

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private BuildingRepository buildingRepository;
    
    @Autowired
    private com.mytech.apartment.portal.repositories.UserRepository userRepository;

    @Autowired
    private ApartmentResidentMapper apartmentResidentMapper;

    public List<ApartmentResidentDto> getAllApartmentResidents() {
        return apartmentResidentRepository.findAll().stream()
                .map(entity -> {
                    ApartmentResidentDto dto = apartmentResidentMapper.toDto(entity);
                    // Bổ sung thông tin đầy đủ
                    enhanceApartmentResidentDto(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Optional<ApartmentResidentDto> getApartmentResidentById(Long apartmentId, Long userId) {
        ApartmentResidentId id = new ApartmentResidentId(apartmentId, userId);
        return apartmentResidentRepository.findById(id).map(apartmentResidentMapper::toDto);
    }

    public List<ApartmentResidentDto> getApartmentResidentsByUserId(Long userId) {
        return apartmentResidentRepository.findByIdUserId(userId).stream() // Changed from findByIdResidentId to findByIdUserId
                .map(entity -> {
                    ApartmentResidentDto dto = apartmentResidentMapper.toDto(entity);
                    // Bổ sung thông tin đầy đủ
                    enhanceApartmentResidentDto(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ApartmentResidentDto addResidentToApartment(ApartmentResidentDto dto) {
        ApartmentResident entity = apartmentResidentMapper.toEntity(dto);
        // Additional validation can be done here (e.g., check if apartment and resident exist)
        ApartmentResident savedEntity = apartmentResidentRepository.save(entity);
        return apartmentResidentMapper.toDto(savedEntity);
    }

    @Transactional
    public void removeResidentFromApartment(Long apartmentId, Long userId) {
        ApartmentResidentId id = new ApartmentResidentId(apartmentId, userId);
        if (!apartmentResidentRepository.existsById(id)) {
            throw new RuntimeException("Apartment-Resident relationship not found");
        }
        apartmentResidentRepository.deleteById(id);
    }

    // Tạo mối quan hệ mới giữa user và apartment
    public ApartmentResidentDto createApartmentResident(ApartmentResidentCreateRequest request) {
        // Kiểm tra apartment và user có tồn tại không
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra mối quan hệ đã tồn tại chưa
        if (apartmentResidentRepository.existsByUser_IdAndApartment_Id(request.getUserId(), request.getApartmentId())) {
            throw new RuntimeException("Mối quan hệ này đã tồn tại");
        }

        // Tạo mối quan hệ mới
        ApartmentResident apartmentResident = ApartmentResident.builder()
                .apartment(apartment)
                .user(user)
                .relationType(request.getRelationType())
                .moveInDate(request.getMoveInDate())
                .moveOutDate(request.getMoveOutDate())
                .isPrimaryResident(request.getIsPrimaryResident())
                .build();

        ApartmentResident saved = apartmentResidentRepository.save(apartmentResident);
        return apartmentResidentMapper.toDto(saved);
    }

    // Lấy tất cả cư dân của một căn hộ
    public List<ApartmentResidentDto> getResidentsByApartment(Long apartmentId) {
        return apartmentResidentRepository.findByApartment_Id(apartmentId).stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    // Lấy tất cả căn hộ của một user
    public List<ApartmentResidentDto> getApartmentsByUser(Long userId) {
        return apartmentResidentRepository.findByUser_Id(userId).stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    // Lấy căn hộ theo loại quan hệ
    public List<ApartmentResidentDto> getApartmentsByUserAndRelationType(Long userId, RelationType relationType) {
        return apartmentResidentRepository.findByUser_IdAndRelationType(userId, relationType).stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    // Lấy chủ sở hữu của căn hộ
    public List<ApartmentResidentDto> getOwnersByApartment(Long apartmentId) {
        return apartmentResidentRepository.findByApartment_IdAndRelationType(apartmentId, RelationType.OWNER).stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    // Lấy cư dân chính của căn hộ
    public Optional<ApartmentResidentDto> getPrimaryResidentByApartment(Long apartmentId) {
        return apartmentResidentRepository.findByApartment_IdAndIsPrimaryResidentTrue(apartmentId)
                .map(apartmentResidentMapper::toDto);
    }

    // Kiểm tra user có quyền với apartment không
    public boolean hasAccessToApartment(Long userId, Long apartmentId) {
        return apartmentResidentRepository.existsByUser_IdAndApartment_Id(userId, apartmentId);
    }

    // Cập nhật mối quan hệ
    public ApartmentResidentDto updateApartmentResident(Long apartmentId, Long userId, ApartmentResidentCreateRequest request) {
        ApartmentResident existing = apartmentResidentRepository.findByApartment_IdAndUser_Id(apartmentId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mối quan hệ"));

        existing.setRelationType(request.getRelationType());
        existing.setMoveInDate(request.getMoveInDate());
        existing.setMoveOutDate(request.getMoveOutDate());
        existing.setIsPrimaryResident(request.getIsPrimaryResident());

        ApartmentResident saved = apartmentResidentRepository.save(existing);
        return apartmentResidentMapper.toDto(saved);
    }

    // Xóa mối quan hệ
    public void deleteApartmentResident(Long apartmentId, Long userId) {
        apartmentResidentRepository.deleteByApartment_IdAndUser_Id(apartmentId, userId);
    }

    /**
     * Get apartment residents by apartment ID
     * Lấy danh sách cư dân theo ID căn hộ
     */
    public List<ApartmentResidentDto> getApartmentResidentsByApartmentId(Long apartmentId) {
        return apartmentResidentRepository.findByIdApartmentId(apartmentId).stream()
                .map(entity -> {
                    ApartmentResidentDto dto = apartmentResidentMapper.toDto(entity);
                    // Bổ sung thông tin đầy đủ
                    enhanceApartmentResidentDto(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Enhance ApartmentResidentDto with full user and apartment information
     * Bổ sung thông tin đầy đủ cho ApartmentResidentDto
     */
    private void enhanceApartmentResidentDto(ApartmentResidentDto dto) {
        // Bổ sung thông tin user
        User user = userRepository.findById(dto.getUserId()).orElse(null);
        if (user != null) {
            dto.setUserFullName(user.getFullName());
            dto.setUserPhoneNumber(user.getPhoneNumber());
            dto.setUserEmail(user.getEmail());
            dto.setUserAvatarUrl(user.getAvatarUrl());
            dto.setUserStatus(user.getStatus().name());
        }

        // Bổ sung thông tin căn hộ
        Apartment apartment = apartmentRepository.findById(dto.getApartmentId()).orElse(null);
        if (apartment != null) {
            dto.setUnitNumber(apartment.getUnitNumber());
            dto.setApartmentStatus(apartment.getStatus().name());
            dto.setApartmentArea(apartment.getArea());
            dto.setApartmentFloorNumber(apartment.getFloorNumber());
            
            // Bổ sung thông tin tòa nhà
            Building building = buildingRepository.findById(apartment.getBuildingId()).orElse(null);
            if (building != null) {
                dto.setBuildingName(building.getBuildingName());
            }
        }
    }

    // Đếm số cư dân của căn hộ
    public long countResidentsByApartment(Long apartmentId) {
        return apartmentResidentRepository.countByApartment_Id(apartmentId);
    }

    // Đếm số căn hộ của user
    public long countApartmentsByUser(Long userId) {
        return apartmentResidentRepository.countByUser_Id(userId);
    }
} 