package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.Building;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.BuildingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApartmentResidentService {

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private ApartmentResidentMapper apartmentResidentMapper;

    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private BuildingRepository buildingRepository;
    
    @Autowired
    private com.mytech.apartment.portal.repositories.UserRepository userRepository;

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
} 