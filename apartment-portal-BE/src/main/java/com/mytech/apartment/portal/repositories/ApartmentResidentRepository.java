package com.mytech.apartment.portal.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.enums.RelationType;

@Repository
public interface ApartmentResidentRepository extends JpaRepository<ApartmentResident, ApartmentResidentId> {
    
    // Tìm tất cả cư dân của một căn hộ
    List<ApartmentResident> findByApartment_Id(Long apartmentId);
    
    // Tìm tất cả căn hộ của một user
    List<ApartmentResident> findByUser_Id(Long userId);
    
    // Tìm cư dân theo loại quan hệ
    List<ApartmentResident> findByUser_IdAndRelationType(Long userId, RelationType relationType);
    
    // Tìm chủ sở hữu của căn hộ
    List<ApartmentResident> findByApartment_IdAndRelationType(Long apartmentId, RelationType relationType);
    
    // Tìm cư dân chính của căn hộ
    Optional<ApartmentResident> findByApartment_IdAndIsPrimaryResidentTrue(Long apartmentId);
    
    // Kiểm tra user có quyền với apartment không
    boolean existsByUser_IdAndApartment_Id(Long userId, Long apartmentId);
    
    // Tìm theo apartment và user
    Optional<ApartmentResident> findByApartment_IdAndUser_Id(Long apartmentId, Long userId);
    
    // Đếm số cư dân của một căn hộ
    long countByApartment_Id(Long apartmentId);
    
    // Đếm số căn hộ của một user
    long countByUser_Id(Long userId);
} 