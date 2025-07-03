package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ApartmentInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApartmentInvitationRepository extends JpaRepository<ApartmentInvitation, Long> {
    Optional<ApartmentInvitation> findByCode(String code);
} 