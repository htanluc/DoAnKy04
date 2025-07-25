package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
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

    public List<ApartmentResidentDto> getAllApartmentResidents() {
        return apartmentResidentRepository.findAll().stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ApartmentResidentDto> getApartmentResidentById(Long apartmentId, Long residentId) {
        ApartmentResidentId id = new ApartmentResidentId(apartmentId, residentId);
        return apartmentResidentRepository.findById(id).map(apartmentResidentMapper::toDto);
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