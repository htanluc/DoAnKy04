package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.VehicleCreateRequest;
import com.mytech.apartment.portal.dtos.VehicleDto;
import com.mytech.apartment.portal.mappers.VehicleMapper;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.Vehicle;
import com.mytech.apartment.portal.models.enums.VehicleStatus;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.repositories.VehicleRepository;
import com.mytech.apartment.portal.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserService userService;
    private final ApartmentResidentService apartmentResidentService;

    public VehicleDto createVehicle(VehicleCreateRequest request, Authentication authentication) {
        // Kiểm tra biển số xe đã tồn tại chưa
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new RuntimeException("Biển số xe đã được đăng ký");
        }

        // Lấy thông tin user hiện tại
        String username = authentication.getName();
        Long userId = userService.getUserIdByPhoneNumber(username);
        if (userId == null) {
            throw new RuntimeException("Không tìm thấy thông tin người dùng");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));

        // Kiểm tra apartment có tồn tại không
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ"));

        // Kiểm tra user có quyền với apartment này không
        if (!apartmentResidentService.hasAccessToApartment(userId, request.getApartmentId())) {
            throw new RuntimeException("Bạn không có quyền đăng ký xe cho căn hộ này");
        }

        // Tạo vehicle mới
        Vehicle vehicle = vehicleMapper.toEntity(request);
        vehicle.setUser(user);
        vehicle.setApartment(apartment);
        vehicle.setMonthlyFee(request.getVehicleType().getMonthlyFee());

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(savedVehicle);
    }

    public List<VehicleDto> getVehiclesByCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        Long userId = userService.getUserIdByPhoneNumber(username);
        if (userId == null) {
            throw new RuntimeException("Không tìm thấy thông tin người dùng");
        }
        
        // Lấy tất cả xe của user trong các căn hộ mà họ sở hữu/thuê
        List<Vehicle> vehicles = vehicleRepository.findByUserIdAndUserApartments(userId);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getVehiclesByUserAndApartment(Long userId, Long apartmentId) {
        // Kiểm tra quyền truy cập
        if (!apartmentResidentService.hasAccessToApartment(userId, apartmentId)) {
            throw new RuntimeException("Không có quyền truy cập căn hộ này");
        }
        
        List<Vehicle> vehicles = vehicleRepository.findByUserIdAndApartmentId(userId, apartmentId);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getVehiclesByApartment(Long apartmentId) {
        List<Vehicle> vehicles = vehicleRepository.findByApartmentId(apartmentId);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        return vehicleMapper.toDto(vehicle);
    }

    public VehicleDto updateVehicleStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        vehicle.setStatus(status);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(updatedVehicle);
    }

    public List<VehicleDto> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status).stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getPendingVehicles() {
        return getVehiclesByStatus(VehicleStatus.PENDING);
    }

    public List<VehicleDto> getApprovedVehicles() {
        return getVehiclesByStatus(VehicleStatus.APPROVED);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    public List<VehicleType> getVehicleTypes() {
        return List.of(VehicleType.values());
    }

    /**
     * [EN] Get vehicles by user ID
     * [VI] Lấy danh sách xe theo ID người dùng
     */
    public List<VehicleDto> getVehiclesByUserId(Long userId) {
        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Get vehicles by apartment ID
     * [VI] Lấy danh sách xe theo ID căn hộ
     */
    public List<VehicleDto> getVehiclesByApartmentId(Long apartmentId) {
        // Lấy tất cả xe để tạm thời giải quyết vấn đề
        // TODO: Implement proper apartment-user-vehicle relationship query
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }
} 