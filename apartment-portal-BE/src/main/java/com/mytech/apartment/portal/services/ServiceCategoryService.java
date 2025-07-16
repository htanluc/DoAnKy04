package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ServiceCategoryDto;
import com.mytech.apartment.portal.models.ServiceCategory;
import com.mytech.apartment.portal.repositories.ServiceCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceCategoryService {
    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;

    public List<ServiceCategoryDto> getAllServiceCategories() {
        return serviceCategoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ServiceCategoryDto> getServiceCategoryById(Long id) {
        return serviceCategoryRepository.findById(id).map(this::toDto);
    }

    private ServiceCategoryDto toDto(ServiceCategory serviceCategory) {
        return new ServiceCategoryDto(
            serviceCategory.getId(),
            serviceCategory.getCategoryCode(),
            serviceCategory.getCategoryName(),
            serviceCategory.getAssignedRole(),
            serviceCategory.getDescription()
        );
    }
} 