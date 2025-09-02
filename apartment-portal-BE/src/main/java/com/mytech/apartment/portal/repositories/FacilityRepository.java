package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByIsVisibleTrue();
} 