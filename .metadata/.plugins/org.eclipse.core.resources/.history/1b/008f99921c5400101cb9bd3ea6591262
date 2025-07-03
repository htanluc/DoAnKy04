package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentResidentRepository extends JpaRepository<ApartmentResident, ApartmentResidentId> {
    List<ApartmentResident> findByIdApartmentId(Long apartmentId);
    List<ApartmentResident> findByIdUserId(Long userId);
} 