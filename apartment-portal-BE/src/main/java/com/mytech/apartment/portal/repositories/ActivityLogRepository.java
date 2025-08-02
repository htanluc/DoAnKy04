package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserId(Long userId);
    List<ActivityLog> findByActionType(String actionType);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.timestamp DESC")
    List<ActivityLog> findRecentByUserIdOrderByTimestampDesc(@Param("userId") Long userId);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.timestamp DESC LIMIT :limit")
    List<ActivityLog> findRecentByUserIdOrderByTimestampDescLimit(@Param("userId") Long userId, @Param("limit") int limit);
} 