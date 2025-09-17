package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    List<Apartment> findByBuildingId(Long buildingId);
    List<Apartment> findByStatus(ApartmentStatus status);
    Optional<Apartment> findByUnitNumber(String unitNumber);
}
