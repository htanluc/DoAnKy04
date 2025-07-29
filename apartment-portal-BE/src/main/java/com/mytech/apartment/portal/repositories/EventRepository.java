package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStartTimeAfter(LocalDateTime startTime);
    List<Event> findByEndTimeBefore(LocalDateTime endTime);
    List<Event> findByStartTimeBeforeAndEndTimeAfter(LocalDateTime startTime, LocalDateTime endTime);
    List<Event> findByTitleContainingIgnoreCase(String title);
    List<Event> findByDescriptionContainingIgnoreCase(String description);
    List<Event> findByLocationContainingIgnoreCase(String location);
} 