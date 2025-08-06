package com.mytech.apartment.portal.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mytech.apartment.portal.dtos.ApartmentResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.mappers.ApartmentResidentMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.RelationType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;

@Service
@Transactional
public class ApartmentResidentService {

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApartmentResidentMapper apartmentResidentMapper;

    // Tạo mối quan hệ mới giữa user và apartment
    public ApartmentResidentDto createApartmentResident(ApartmentResidentCreateRequest request) {
        // Kiểm tra apartment và user có tồn tại không
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra mối quan hệ đã tồn tại chưa
        if (apartmentResidentRepository.existsByUser_IdAndApartment_Id(request.getUserId(), request.getApartmentId())) {
            throw new RuntimeException("Mối quan hệ này đã tồn tại");
        }

        // Tạo mối quan hệ mới
        ApartmentResident apartmentResident = ApartmentResident.builder()
                .apartment(apartment)
                .user(user)
                .relationType(request.getRelationType())
                .moveInDate(request.getMoveInDate())
                .moveOutDate(request.getMoveOutDate())
                .isPrimaryResident(request.getIsPrimaryResident())
                .createdAt(LocalDateTime.now())
                .build();

        // Nếu đây là cư dân chính, cập nhật các cư dân khác thành không chính
        if (Boolean.TRUE.equals(request.getIsPrimaryResident())) {
            apartmentResidentRepository.findByApartment_IdAndIsPrimaryResidentTrue(request.getApartmentId())
                    .ifPresent(existing -> {
                        existing.setIsPrimaryResident(false);
                        apartmentResidentRepository.save(existing);
                    });
        }

        ApartmentResident saved = apartmentResidentRepository.save(apartmentResident);
        return apartmentResidentMapper.toDto(saved);
    }

    // Lấy tất cả cư dân của một căn hộ
    public List<ApartmentResidentDto> getResidentsByApartment(Long apartmentId) {
        List<ApartmentResident> residents = apartmentResidentRepository.findByApartment_Id(apartmentId);
        return residents.stream()
                .map(apartmentResidentMapper::toDto)
                .toList();
    }

    // Lấy tất cả căn hộ của một user
    public List<ApartmentResidentDto> getApartmentsByUser(Long userId) {
        List<ApartmentResident> apartments = apartmentResidentRepository.findByUser_Id(userId);
        return apartments.stream()
                .map(apartmentResidentMapper::toDto)
                .toList();
    }

    // Lấy căn hộ theo loại quan hệ
    public List<ApartmentResidentDto> getApartmentsByUserAndRelationType(Long userId, RelationType relationType) {
        List<ApartmentResident> apartments = apartmentResidentRepository.findByUser_IdAndRelationType(userId, relationType);
        return apartments.stream()
                .map(apartmentResidentMapper::toDto)
                .toList();
    }

    // Lấy chủ sở hữu của căn hộ
    public List<ApartmentResidentDto> getOwnersByApartment(Long apartmentId) {
        List<ApartmentResident> owners = apartmentResidentRepository.findByApartment_IdAndRelationType(apartmentId, RelationType.OWNER);
        return owners.stream()
                .map(apartmentResidentMapper::toDto)
                .toList();
    }

    // Lấy cư dân chính của căn hộ
    public Optional<ApartmentResidentDto> getPrimaryResidentByApartment(Long apartmentId) {
        return apartmentResidentRepository.findByApartment_IdAndIsPrimaryResidentTrue(apartmentId)
                .map(apartmentResidentMapper::toDto);
    }

    // Kiểm tra user có quyền với apartment không
    public boolean hasAccessToApartment(Long userId, Long apartmentId) {
        return apartmentResidentRepository.existsByUser_IdAndApartment_Id(userId, apartmentId);
    }

    // Cập nhật mối quan hệ
    public ApartmentResidentDto updateApartmentResident(Long apartmentId, Long userId, ApartmentResidentCreateRequest request) {
        ApartmentResident existing = apartmentResidentRepository.findByApartment_IdAndUser_Id(apartmentId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mối quan hệ"));

        existing.setRelationType(request.getRelationType());
        existing.setMoveInDate(request.getMoveInDate());
        existing.setMoveOutDate(request.getMoveOutDate());
        existing.setIsPrimaryResident(request.getIsPrimaryResident());

        ApartmentResident updated = apartmentResidentRepository.save(existing);
        return apartmentResidentMapper.toDto(updated);
    }

    // Xóa mối quan hệ
    public void deleteApartmentResident(Long apartmentId, Long userId) {
        ApartmentResidentId id = new ApartmentResidentId(apartmentId, userId);
        apartmentResidentRepository.deleteById(id);
    }

    // Đếm số cư dân của căn hộ
    public long countResidentsByApartment(Long apartmentId) {
        return apartmentResidentRepository.countByApartment_Id(apartmentId);
    }

    // Đếm số căn hộ của user
    public long countApartmentsByUser(Long userId) {
        return apartmentResidentRepository.countByUser_Id(userId);
    }
} 