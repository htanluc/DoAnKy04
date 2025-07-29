package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.AnnouncementCreateRequest;
import com.mytech.apartment.portal.dtos.AnnouncementDto;
import com.mytech.apartment.portal.dtos.AnnouncementUpdateRequest;
import com.mytech.apartment.portal.mappers.AnnouncementMapper;
import com.mytech.apartment.portal.models.Announcement;
import com.mytech.apartment.portal.models.AnnouncementRead;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.AnnouncementRepository;
import com.mytech.apartment.portal.repositories.AnnouncementReadRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private AnnouncementMapper announcementMapper;
    
    @Autowired
    private AnnouncementReadRepository announcementReadRepository;
    
    @Autowired
    private UserRepository userRepository;

    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findAll().stream()
                .map(announcementMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AnnouncementDto> getAllAnnouncementsForUser(String username) {
        // Lấy user ID từ username
        Optional<User> userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            return getAllAnnouncements(); // Fallback to all announcements
        }
        
        Long userId = userOpt.get().getId();
        
        // Lấy danh sách ID thông báo đã đọc
        List<Long> readAnnouncementIds = announcementReadRepository.findReadAnnouncementIdsByUserId(userId);
        
        // Lấy tất cả thông báo và đánh dấu trạng thái đọc
        return announcementRepository.findAll().stream()
                .map(announcement -> {
                    boolean isRead = readAnnouncementIds.contains(announcement.getId());
                    return announcementMapper.toDto(announcement, isRead);
                })
                .collect(Collectors.toList());
    }

    public Optional<AnnouncementDto> getAnnouncementById(Long id) {
        return announcementRepository.findById(id).map(announcementMapper::toDto);
    }

    public Optional<AnnouncementDto> getAnnouncementByIdForUser(Long id, String username) {
        Optional<Announcement> announcementOpt = announcementRepository.findById(id);
        if (announcementOpt.isEmpty()) {
            return Optional.empty();
        }
        
        // Lấy user ID từ username
        Optional<User> userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            return announcementOpt.map(announcementMapper::toDto);
        }
        
        Long userId = userOpt.get().getId();
        
        // Kiểm tra trạng thái đọc
        boolean isRead = announcementReadRepository.findByAnnouncementIdAndUserId(id, userId).isPresent();
        
        return announcementOpt.map(announcement -> announcementMapper.toDto(announcement, isRead));
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementCreateRequest request, Long createdBy) {
        Announcement announcement = announcementMapper.toEntity(request, createdBy);
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return announcementMapper.toDto(savedAnnouncement);
    }

    @Transactional
    public AnnouncementDto updateAnnouncement(Long id, AnnouncementUpdateRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id " + id));

        announcementMapper.updateEntityFromRequest(announcement, request);
        Announcement updatedAnnouncement = announcementRepository.save(announcement);
        return announcementMapper.toDto(updatedAnnouncement);
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    /**
     * [EN] Mark announcement as read by user
     * [VI] Đánh dấu thông báo đã đọc bởi user
     */
    @Transactional
    public boolean markAsRead(Long announcementId, String username) {
        try {
            // Lấy user ID từ username
            Optional<User> userOpt = userRepository.findByPhoneNumber(username);
            if (userOpt.isEmpty()) {
                return false;
            }
            
            User user = userOpt.get();
            
            // Kiểm tra thông báo tồn tại
            Optional<Announcement> announcementOpt = announcementRepository.findById(announcementId);
            if (announcementOpt.isEmpty()) {
                return false;
            }
            
            // Kiểm tra đã đọc chưa
            Optional<AnnouncementRead> existingRead = announcementReadRepository.findByAnnouncementIdAndUserId(announcementId, user.getId());
            if (existingRead.isPresent()) {
                return true; // Đã đọc rồi
            }
            
            // Tạo record đọc mới
            AnnouncementRead read = AnnouncementRead.builder()
                    .announcement(announcementOpt.get())
                    .user(user)
                    .build();
            
            announcementReadRepository.save(read);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * [EN] Get unread announcement count for user
     * [VI] Lấy số thông báo chưa đọc cho user
     */
    public Long getUnreadCount(String username) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            return 0L;
        }
        
        Long userId = userOpt.get().getId();
        Long totalAnnouncements = announcementRepository.count();
        Long readAnnouncements = announcementReadRepository.countReadAnnouncementsByUserId(userId);
        
        return totalAnnouncements - readAnnouncements;
    }
} 