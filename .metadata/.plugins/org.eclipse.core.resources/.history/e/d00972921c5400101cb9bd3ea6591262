package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Resident findByUserId(Long userId);
}
