package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ResidentDto;
import com.mytech.apartment.portal.dtos.ResidentUpdateRequest;
import com.mytech.apartment.portal.mappers.ResidentMapper;
import com.mytech.apartment.portal.models.Resident;
import com.mytech.apartment.portal.repositories.ResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ResidentService {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private ResidentMapper residentMapper;

    @Autowired
    private UserRepository userRepository;

    public List<ResidentDto> getAllResidents() {
        return residentRepository.findAll().stream()
                .map(residentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ResidentDto> getResidentById(Long id) {
        return residentRepository.findById(id).map(residentMapper::toDto);
    }

    @Transactional
    public ResidentDto createResident(ResidentCreateRequest request) {
        Resident resident = residentMapper.toEntity(request);
        // Có thể thêm logic để liên kết với User ở đây
        // resident.setUserId(...);
        Resident savedResident = residentRepository.save(resident);
        return residentMapper.toDto(savedResident);
    }

    @Transactional
    public ResidentDto updateResident(Long id, ResidentUpdateRequest request) {
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found with id " + id));

        residentMapper.updateEntityFromRequest(resident, request);
        resident.setStatus(1);
        if (resident.getUserId() != null && resident.getFullName() != null) {
            userRepository.findById(resident.getUserId()).ifPresent(user -> {
                user.setUsername(resident.getFullName());
                userRepository.save(user);
            });
        }
        Resident updatedResident = residentRepository.save(resident);
        return residentMapper.toDto(updatedResident);
    }

    public void deleteResident(Long id) {
        residentRepository.deleteById(id);
    }

    public Optional<ResidentDto> getResidentByUserId(Long userId) {
        Resident resident = residentRepository.findByUserId(userId);
        return Optional.ofNullable(residentMapper.toDto(resident));
    }

    public ResidentDto getResidentByUsername(String username) {
        // Tìm user theo username (có thể là phone/email/username)
        return userRepository.findByUsername(username)
            .flatMap(user -> getResidentByUserId(user.getId()))
            .orElse(null);
    }

    @Transactional
    public ResidentDto updateResidentByUsername(String username, ResidentUpdateRequest request) {
        return userRepository.findByUsername(username)
            .flatMap(user -> {
                Resident resident = residentRepository.findByUserId(user.getId());
                if (resident == null) return Optional.<ResidentDto>empty();
                residentMapper.updateEntityFromRequest(resident, request);
                Resident updated = residentRepository.save(resident);
                return Optional.of(residentMapper.toDto(updated));
            })
            .orElse(null);
    }
} 