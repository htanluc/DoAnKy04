package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, String> {
    Optional<ServiceCategory> findByCategoryName(String categoryName);
} 