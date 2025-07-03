package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    List<Apartment> findByBuildingId(Long buildingId);
    List<Apartment> findByStatus(String status);
}
