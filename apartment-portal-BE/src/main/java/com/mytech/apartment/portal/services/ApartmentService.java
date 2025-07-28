package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.mappers.ApartmentMapper;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApartmentService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApartmentMapper apartmentMapper;

    @Autowired
    private ApartmentResidentMapper apartmentResidentMapper;

    public List<ApartmentDto> getAllApartments() {
        return apartmentRepository.findAll().stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ApartmentDto> getApartmentById(Long id) {
        return apartmentRepository.findById(id)
                .map(apartmentMapper::toDto);
    }

    @Transactional
    public ApartmentDto updateApartment(Long id, ApartmentUpdateRequest request) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found with id " + id));

        apartmentMapper.updateEntityFromRequest(apartment, request);
        Apartment updatedApartment = apartmentRepository.save(apartment);
        return apartmentMapper.toDto(updatedApartment);
    }

    @Transactional
    public void linkResidentToApartment(Long apartmentId, ApartmentResidentLinkRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại"));

        if (request.getUserId() == null) {
            throw new RuntimeException("UserId không được để trống");
        }

        ApartmentResidentId id = new ApartmentResidentId(apartmentId, request.getUserId());
        if (apartmentResidentRepository.findById(id).isPresent()) {
            throw new RuntimeException("User đã được liên kết với căn hộ này");
        }

        ApartmentResident apartmentResident = ApartmentResident.builder()
                .id(id)
                .relationType(request.getRelationType())
                .moveInDate(request.getMoveInDate() != null ? request.getMoveInDate() : LocalDate.now())
                .moveOutDate(request.getMoveOutDate())
                .build();

        apartmentResidentRepository.save(apartmentResident);

        if (ApartmentStatus.VACANT.equals(apartment.getStatus())) {
            apartment.setStatus(ApartmentStatus.OCCUPIED);
            apartmentRepository.save(apartment);
        }
    }

    public List<ApartmentResidentDto> getApartmentLinksOfUser(Long userId) {
        List<ApartmentResident> links = apartmentResidentRepository.findByIdUserId(userId);
        return links.stream()
            .map(apartmentResidentMapper::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void unlinkResidentFromApartment(Long apartmentId, Long userId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại"));

        ApartmentResidentId id = new ApartmentResidentId(apartmentId, userId);
        apartmentResidentRepository.deleteById(id);

        List<ApartmentResident> remainingLinks = apartmentResidentRepository.findByIdApartmentId(apartmentId);
        if (remainingLinks.isEmpty()) {
            apartment.setStatus(ApartmentStatus.VACANT);
            apartmentRepository.save(apartment);
        }
    }

    public List<ApartmentResidentDto> getApartmentResidents(Long apartmentId) {
        if (!apartmentRepository.existsById(apartmentId)) {
            throw new RuntimeException("Căn hộ không tồn tại");
        }

        return apartmentResidentRepository.findByIdApartmentId(apartmentId).stream()
                .map(apartmentResidentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ApartmentDto> getApartmentsByBuilding(Long buildingId) {
        return apartmentRepository.findByBuildingId(buildingId).stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ApartmentDto> getApartmentsByStatus(String status) {
        return apartmentRepository.findByStatus(ApartmentStatus.valueOf(status)).stream()
                .map(apartmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ApartmentDto> getApartmentsOfResident(Long userId) {
        List<ApartmentResident> links = apartmentResidentRepository.findByIdUserId(userId);
        return links.stream()
            .map(link -> apartmentRepository.findById(link.getId().getApartmentId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(apartmentMapper::toDto)
            .collect(Collectors.toList());
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(user -> user.getId())
            .orElse(null);
    }

    public Long getUserIdByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .map(user -> user.getId())
            .orElse(null);
    }

    /**
     * Lấy tên căn hộ theo ID, sử dụng cho WaterMeterService
     */
    public String getApartmentName(Integer apartmentId) {
        return apartmentRepository.findById(apartmentId.longValue())
                .map(Apartment::getUnitNumber)
                .orElse("Unknown apartment");
    }
}
