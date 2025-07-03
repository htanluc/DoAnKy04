package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ServiceRequest;
import com.mytech.apartment.portal.models.enums.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByStatus(ServiceRequestStatus status);
    List<ServiceRequest> findByAssignedToId(Long assignedToId);
    List<ServiceRequest> findByCategoryCategoryName(String categoryName);
    List<ServiceRequest> findByCategoryAssignedRole(String assignedRole);
    List<ServiceRequest> findByUserId(Long userId);
} 