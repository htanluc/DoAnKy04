package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead, Long> {
    
    @Query("SELECT ar FROM AnnouncementRead ar WHERE ar.announcement.id = :announcementId AND ar.user.id = :userId")
    Optional<AnnouncementRead> findByAnnouncementIdAndUserId(@Param("announcementId") Long announcementId, @Param("userId") Long userId);
    
    @Query("SELECT ar.announcement.id FROM AnnouncementRead ar WHERE ar.user.id = :userId")
    List<Long> findReadAnnouncementIdsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(ar) FROM AnnouncementRead ar WHERE ar.user.id = :userId")
    Long countReadAnnouncementsByUserId(@Param("userId") Long userId);
} 