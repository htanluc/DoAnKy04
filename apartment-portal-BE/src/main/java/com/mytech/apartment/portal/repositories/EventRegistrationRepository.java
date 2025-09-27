package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.EventRegistration;
import com.mytech.apartment.portal.models.enums.EventRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    int countByEventIdAndStatus(Long eventId, EventRegistrationStatus status);
    boolean existsByEventIdAndUserIdAndStatus(Long eventId, Long userId, EventRegistrationStatus status);
    List<EventRegistration> findByEventId(Long eventId);
    List<EventRegistration> findByUserId(Long userId);
    Optional<EventRegistration> findByEventIdAndUserId(Long eventId, Long userId);
    List<EventRegistration> findAllByEventIdAndUserId(Long eventId, Long userId);
    
    /**
     * Find all event registrations with event details for staff check-in
     * @return List of event registrations with joined event data
     */
    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event e JOIN FETCH er.user u")
    List<EventRegistration> findAllWithEventDetails();
    
    /**
     * Find all event registrations (simple version)
     * @return List of all event registrations
     */
    @Query("SELECT er FROM EventRegistration er")
    List<EventRegistration> findAllSimple();
} 