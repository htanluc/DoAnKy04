package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
} 