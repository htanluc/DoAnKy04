package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.EventRegistration;
import com.mytech.apartment.portal.models.enums.EventRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    int countByEventIdAndStatus(Long eventId, EventRegistrationStatus status);
    boolean existsByEventIdAndResidentIdAndStatus(Long eventId, Long residentId, EventRegistrationStatus status);
    List<EventRegistration> findByEventId(Long eventId);
    List<EventRegistration> findByResidentId(Long residentId);
    Optional<EventRegistration> findByEventIdAndResidentId(Long eventId, Long residentId);
    List<EventRegistration> findAllByEventIdAndResidentId(Long eventId, Long residentId);
} 