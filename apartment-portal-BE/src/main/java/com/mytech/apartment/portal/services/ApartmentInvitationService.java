package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ApartmentInvitationDto;
import com.mytech.apartment.portal.mappers.ApartmentInvitationMapper;
import com.mytech.apartment.portal.models.ApartmentInvitation;
import com.mytech.apartment.portal.repositories.ApartmentInvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApartmentInvitationService {
    @Autowired
    private ApartmentInvitationRepository invitationRepository;

    @Autowired
    private ApartmentInvitationMapper invitationMapper;

    public List<ApartmentInvitationDto> getAllInvitations() {
        return invitationRepository.findAll().stream().map(invitationMapper::toDto).collect(Collectors.toList());
    }

    public Optional<ApartmentInvitationDto> getInvitationById(Long id) {
        return invitationRepository.findById(id).map(invitationMapper::toDto);
    }

    public Optional<ApartmentInvitationDto> getInvitationByCode(String code) {
        return invitationRepository.findByCode(code).map(invitationMapper::toDto);
    }

    public ApartmentInvitationDto createInvitation(Long apartmentId, Long validityInHours) {
        ApartmentInvitation invitation = new ApartmentInvitation();
        invitation.setApartmentId(apartmentId);
        invitation.setCode(UUID.randomUUID().toString());
        invitation.setUsed(false);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(validityInHours));

        ApartmentInvitation savedInvitation = invitationRepository.save(invitation);
        return invitationMapper.toDto(savedInvitation);
    }

    public ApartmentInvitationDto markAsUsed(String code, Long userId) {
        ApartmentInvitation invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invitation code not found or is invalid."));

        if (invitation.isUsed()) {
            throw new RuntimeException("Invitation code has already been used.");
        }
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation code has expired.");
        }

        invitation.setUsed(true);
        invitation.setUsedByUserId(userId);
        ApartmentInvitation updatedInvitation = invitationRepository.save(invitation);
        return invitationMapper.toDto(updatedInvitation);
    }

    public void deleteInvitation(Long id) {
        invitationRepository.deleteById(id);
    }
} 