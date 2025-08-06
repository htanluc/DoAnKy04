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
    
    // Alias method for finding vehicles by resident user ID (same as findByUserId)
    default List<Vehicle> findByResidentUserId(Long userId) {
        return findByUserId(userId);
    }
    
    List<Vehicle> findByStatus(VehicleStatus status);
    
    List<Vehicle> findByApartmentId(Long apartmentId);
    
    List<Vehicle> findByUserIdAndApartmentId(Long userId, Long apartmentId);
    
    @Query("SELECT v FROM Vehicle v WHERE v.user.id = :userId AND v.apartment.id IN " +
           "(SELECT ar.id.apartmentId FROM ApartmentResident ar WHERE ar.id.userId = :userId)")
    List<Vehicle> findByUserIdAndUserApartments(@Param("userId") Long userId);
    
    boolean existsByLicensePlate(String licensePlate);
    
    boolean existsByLicensePlateAndIdNot(String licensePlate, Long id);
} 