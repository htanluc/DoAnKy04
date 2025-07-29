package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.EmergencyContact;
import com.mytech.apartment.portal.models.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByResident(Resident resident);
    void deleteByResident(Resident resident);
} 