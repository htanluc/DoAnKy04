package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Vehicle;
import com.mytech.apartment.portal.models.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    
    List<Vehicle> findByUserId(Long userId);
    
    List<Vehicle> findByStatus(VehicleStatus status);
    

    
    boolean existsByLicensePlate(String licensePlate);
    
    boolean existsByLicensePlateAndIdNot(String licensePlate, Long id);
} 