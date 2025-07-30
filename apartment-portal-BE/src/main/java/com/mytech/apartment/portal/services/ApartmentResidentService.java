package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.Building;
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

    public List<ApartmentResidentDto> getAllApartmentResidents() {
        return apartmentResidentRepository.findAll().stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ApartmentResidentDto> getApartmentResidentById(Long apartmentId, Long residentId) {
        ApartmentResidentId id = new ApartmentResidentId(apartmentId, residentId);
        return apartmentResidentRepository.findById(id).map(apartmentResidentMapper::toDto);
    }

    public List<ApartmentResidentDto> getApartmentResidentsByUserId(Long userId) {
        return apartmentResidentRepository.findByIdResidentId(userId).stream() // Sửa từ findByIdUserId thành findByIdResidentId
                .map(entity -> {
                    ApartmentResidentDto dto = apartmentResidentMapper.toDto(entity);
                    // Bổ sung thông tin căn hộ và tòa
                    Apartment apartment = apartmentRepository.findById(dto.getApartmentId()).orElse(null);
                    if (apartment != null) {
                        dto.setUnitNumber(apartment.getUnitNumber());
                        Building building = buildingRepository.findById(apartment.getBuildingId()).orElse(null);
                        if (building != null) {
                            dto.setBuildingName(building.getBuildingName());
                        }
                    }
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
    public void removeResidentFromApartment(Long apartmentId, Long residentId) {
        ApartmentResidentId id = new ApartmentResidentId(apartmentId, residentId);
        if (!apartmentResidentRepository.existsById(id)) {
            throw new RuntimeException("Apartment-Resident relationship not found");
        }
        apartmentResidentRepository.deleteById(id);
    }
} 