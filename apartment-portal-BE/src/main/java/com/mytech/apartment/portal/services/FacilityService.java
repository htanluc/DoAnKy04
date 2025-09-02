package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.FacilityCreateRequest;
import com.mytech.apartment.portal.dtos.FacilityDto;
import com.mytech.apartment.portal.dtos.FacilityUpdateRequest;
import com.mytech.apartment.portal.mappers.FacilityMapper;
import com.mytech.apartment.portal.models.Facility;
import com.mytech.apartment.portal.repositories.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacilityService {
    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private FacilityMapper facilityMapper;

    public List<FacilityDto> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(facilityMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<FacilityDto> getVisibleFacilities() {
        return facilityRepository.findByIsVisibleTrue().stream()
                .map(facilityMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<FacilityDto> getFacilityById(Long id) {
        return facilityRepository.findById(id).map(facilityMapper::toDto);
    }

    public FacilityDto createFacility(FacilityCreateRequest request) {
        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        facility.setLocation(request.getLocation());
        facility.setCapacity(request.getCapacity());
        facility.setOtherDetails(request.getOtherDetails());
        facility.setUsageFee(request.getUsageFee());
        facility.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);

        Facility savedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(savedFacility);
    }

    public FacilityDto updateFacility(Long id, FacilityUpdateRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + id));

        if (request.getName() != null) {
            facility.setName(request.getName());
        }
        if (request.getDescription() != null) {
            facility.setDescription(request.getDescription());
        }
        if (request.getCapacity() != null) {
            facility.setCapacity(request.getCapacity());
        }
        if (request.getOtherDetails() != null) {
            facility.setOtherDetails(request.getOtherDetails());
        }
        if (request.getUsageFee() != null) {
            facility.setUsageFee(request.getUsageFee());
        }
        if (request.getIsVisible() != null) {
            facility.setIsVisible(request.getIsVisible());
        }

        Facility updatedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(updatedFacility);
    }

    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found with id " + id);
        }
        facilityRepository.deleteById(id);
    }

    public FacilityDto toggleFacilityVisibility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + id));
        
        // Toggle visibility
        facility.setIsVisible(!facility.getIsVisible());
        
        Facility updatedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(updatedFacility);
    }
} 