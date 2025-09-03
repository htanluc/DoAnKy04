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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
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
    private final EmailService emailService;
    private final VehicleCapacityConfigService vehicleCapacityConfigService;

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

        // Kiểm tra giới hạn xe cho tòa nhà
        if (!vehicleCapacityConfigService.canAddVehicle(apartment.getBuildingId(), request.getVehicleType())) {
            throw new RuntimeException("Đã đạt giới hạn xe cho loại xe này trong tòa nhà. Vui lòng liên hệ ban quản lý.");
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
        return vehicleRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        return vehicleMapper.toDto(vehicle);
    }

    public VehicleDto updateVehicleStatus(Long id, VehicleStatus status, String rejectionReason) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        if (status == VehicleStatus.REJECTED) {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new RuntimeException("Vui lòng nhập lý do khi từ chối đăng ký xe");
            }
            vehicle.setRejectionReason(rejectionReason);
        }
        vehicle.setStatus(status);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        // Gửi email thông báo cho chủ xe nếu có email
        try {
            User owner = updatedVehicle.getUser();
            if (owner != null && owner.getEmail() != null && !owner.getEmail().isBlank()) {
                String email = owner.getEmail();
                String subject;
                String content;
                switch (status) {
                    case APPROVED:
                        subject = "Xác nhận đăng ký xe đã được duyệt";
                        content = String.format(
                                "<p>Chào %s,</p>" +
                                "<p>Đăng ký xe của bạn đã được <b>DUYỆT</b>.</p>" +
                                "<ul>" +
                                "<li>Biển số: <b>%s</b></li>" +
                                "<li>Loại xe: <b>%s</b></li>" +
                                "<li>Căn hộ: <b>%s</b></li>" +
                                "</ul>" +
                                "<p>Xin cảm ơn!</p>",
                                owner.getFullName() != null ? owner.getFullName() : owner.getUsername(),
                                updatedVehicle.getLicensePlate(),
                                updatedVehicle.getVehicleType(),
                                updatedVehicle.getApartment() != null ? updatedVehicle.getApartment().getUnitNumber() : "-");
                        break;
                    case REJECTED:
                        subject = "Đăng ký xe bị từ chối";
                        content = String.format(
                                "<p>Chào %s,</p>" +
                                "<p>Rất tiếc, đăng ký xe của bạn đã bị <b>TỪ CHỐI</b>.</p>" +
                                "<ul>" +
                                "<li>Biển số: <b>%s</b></li>" +
                                "<li>Loại xe: <b>%s</b></li>" +
                                "</ul>" +
                                (rejectionReason != null && !rejectionReason.isBlank() ? ("<p>Lý do: " + rejectionReason + "</p>") : "") +
                                "<p>Vui lòng liên hệ ban quản lý để biết thêm chi tiết.</p>",
                                owner.getFullName() != null ? owner.getFullName() : owner.getUsername(),
                                updatedVehicle.getLicensePlate(),
                                updatedVehicle.getVehicleType());
                        break;
                    default:
                        subject = null;
                        content = null;
                }

                if (subject != null && content != null) {
                    emailService.sendHtmlEmail(email, subject, content);
                }
            }
        } catch (Exception ignored) {
            // Không chặn luồng nếu gửi mail lỗi
        }

        return vehicleMapper.toDto(updatedVehicle);
    }

    public List<VehicleDto> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatusOrderByCreatedAtAsc(status).stream()
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
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        // Gửi email xác nhận hủy đăng ký xe cho chủ xe (nếu có)
        try {
            User owner = vehicle.getUser();
            if (owner != null && owner.getEmail() != null && !owner.getEmail().isBlank()) {
                String email = owner.getEmail();
                String subject = "Xác nhận hủy đăng ký xe";
                String content = String.format(
                        "<p>Chào %s,</p>" +
                        "<p>Đăng ký xe của bạn đã được <b>HỦY</b>.</p>" +
                        "<ul>" +
                        "<li>Biển số: <b>%s</b></li>" +
                        "<li>Loại xe: <b>%s</b></li>" +
                        "<li>Căn hộ: <b>%s</b></li>" +
                        "</ul>" +
                        "<p>Nếu đây không phải yêu cầu của bạn, vui lòng liên hệ ban quản lý ngay.</p>",
                        owner.getFullName() != null ? owner.getFullName() : owner.getUsername(),
                        vehicle.getLicensePlate(),
                        vehicle.getVehicleType(),
                        vehicle.getApartment() != null ? vehicle.getApartment().getUnitNumber() : "-"
                );
                emailService.sendHtmlEmail(email, subject, content);
            }
        } catch (Exception ignored) {
            // Không chặn luồng nếu gửi mail lỗi
        }

        vehicleRepository.delete(vehicle);
    }

    public List<VehicleType> getVehicleTypes() {
        return List.of(VehicleType.values());
    }
} 