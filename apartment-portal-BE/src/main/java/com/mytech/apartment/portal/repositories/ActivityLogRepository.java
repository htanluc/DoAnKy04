package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    // Find by user
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find by action type
    Page<ActivityLog> findByActionTypeOrderByCreatedAtDesc(ActivityActionType actionType, Pageable pageable);
    
    // Find by user and action type
    Page<ActivityLog> findByUserIdAndActionTypeOrderByCreatedAtDesc(Long userId, ActivityActionType actionType, Pageable pageable);
    
    // Find by date range
    @Query("SELECT al FROM ActivityLog al WHERE al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate, 
                                     Pageable pageable);
    
    // Find by user and date range
    @Query("SELECT al FROM ActivityLog al WHERE al.user.id = :userId AND al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByUserIdAndDateRange(@Param("userId") Long userId,
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate, 
                                              Pageable pageable);
    
    // Find by user, action type and date range
    @Query("SELECT al FROM ActivityLog al WHERE al.user.id = :userId AND al.actionType = :actionType AND al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByUserIdAndActionTypeAndDateRange(@Param("userId") Long userId,
                                                           @Param("actionType") ActivityActionType actionType,
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate, 
                                                           Pageable pageable);
    
    // Find by action type and date range
    @Query("SELECT al FROM ActivityLog al WHERE al.actionType = :actionType AND al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByActionTypeAndDateRange(@Param("actionType") ActivityActionType actionType,
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate, 
                                                  Pageable pageable);
    
    // List versions for export (without pagination)
    
    @Query("SELECT al FROM ActivityLog al WHERE al.user.id = :userId AND al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    List<ActivityLog> findByUserIdAndDateRangeList(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT al FROM ActivityLog al WHERE al.user.id = :userId AND al.actionType = :actionType AND al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    List<ActivityLog> findByUserIdAndActionTypeAndDateRangeList(@Param("userId") Long userId,
                                                               @Param("actionType") ActivityActionType actionType,
                                                               @Param("startDate") LocalDateTime startDate, 
                                                               @Param("endDate") LocalDateTime endDate);
    
    // Count by user and action type
    long countByUserIdAndActionType(Long userId, ActivityActionType actionType);
    
    // Get recent activities for user
    List<ActivityLog> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Get activity statistics
    @Query("SELECT al.actionType, COUNT(al) FROM ActivityLog al WHERE al.user.id = :userId GROUP BY al.actionType")
    List<Object[]> getActivityStatisticsByUser(@Param("userId") Long userId);
    
    // System-wide statistics
    @Query("SELECT al.actionType, COUNT(al) FROM ActivityLog al GROUP BY al.actionType")
    List<Object[]> getSystemActivityStatistics();
    
    // Count activities after a certain date
    long countByCreatedAtAfter(LocalDateTime date);
    
    // Get top active users
    @Query("SELECT al.user.id, al.user.username, COUNT(al) FROM ActivityLog al GROUP BY al.user.id, al.user.username ORDER BY COUNT(al) DESC")
    List<Object[]> getTopActiveUsers(@Param("limit") int limit);
} 