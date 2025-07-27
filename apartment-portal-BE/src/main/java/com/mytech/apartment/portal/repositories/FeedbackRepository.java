package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUser_Id(Long userId);
} 