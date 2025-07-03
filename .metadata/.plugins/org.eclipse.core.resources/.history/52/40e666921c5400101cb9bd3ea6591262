package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.BuildingCreateRequest;
import com.mytech.apartment.portal.dtos.BuildingDto;
import com.mytech.apartment.portal.dtos.BuildingUpdateRequest;
import com.mytech.apartment.portal.mappers.BuildingMapper;
import com.mytech.apartment.portal.models.Building;
import com.mytech.apartment.portal.repositories.BuildingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BuildingService {

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private BuildingMapper buildingMapper;

    public List<BuildingDto> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(buildingMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<BuildingDto> getBuildingById(Long id) {
        return buildingRepository.findById(id).map(buildingMapper::toDto);
    }

    @Transactional
    public BuildingDto createBuilding(BuildingCreateRequest request) {
        Building building = buildingMapper.toEntity(request);
        Building savedBuilding = buildingRepository.save(building);
        return buildingMapper.toDto(savedBuilding);
    }

    @Transactional
    public BuildingDto updateBuilding(Long id, BuildingUpdateRequest request) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));

        buildingMapper.updateEntityFromRequest(building, request);
        Building updatedBuilding = buildingRepository.save(building);
        return buildingMapper.toDto(updatedBuilding);
    }

    public void deleteBuilding(Long id) {
        buildingRepository.deleteById(id);
    }
} 