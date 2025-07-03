package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.AiQaHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiQaHistoryRepository extends JpaRepository<AiQaHistory, Long> {
    List<AiQaHistory> findByUserId(Long userId);
    List<AiQaHistory> findByFeedback(String feedback);
} 