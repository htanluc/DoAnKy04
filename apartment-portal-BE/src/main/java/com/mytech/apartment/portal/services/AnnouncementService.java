package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.AnnouncementCreateRequest;
import com.mytech.apartment.portal.dtos.AnnouncementDto;
import com.mytech.apartment.portal.dtos.AnnouncementUpdateRequest;
import com.mytech.apartment.portal.mappers.AnnouncementMapper;
import com.mytech.apartment.portal.models.Announcement;
import com.mytech.apartment.portal.repositories.AnnouncementRepository;
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

    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findAll().stream()
                .map(announcementMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<AnnouncementDto> getAnnouncementById(Long id) {
        return announcementRepository.findById(id).map(announcementMapper::toDto);
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
} 