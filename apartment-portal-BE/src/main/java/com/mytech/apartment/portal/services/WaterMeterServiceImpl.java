package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.mappers.WaterMeterMapper;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class WaterMeterServiceImpl implements WaterMeterService {
    private final WaterMeterReadingRepository waterMeterReadingRepository;
    private final WaterMeterMapper waterMeterMapper;
    private final ApartmentService apartmentService;
    private final UserService userService;

    @Autowired
    public WaterMeterServiceImpl(WaterMeterReadingRepository waterMeterReadingRepository,
                                 WaterMeterMapper waterMeterMapper,
                                 @Lazy ApartmentService apartmentService,
                                 UserService userService) {
        this.waterMeterReadingRepository = waterMeterReadingRepository;
        this.waterMeterMapper = waterMeterMapper;
        this.apartmentService = apartmentService;
        this.userService = userService;
    }

    @Override
    @Transactional
    public WaterMeterReadingDto addReading(WaterMeterReadingDto dto) {
        normalizeIncomingDto(dto);
        validateReading(dto);
        // Kiểm tra đã có reading cho apartment + month chưa
        Optional<WaterMeterReading> existing = waterMeterReadingRepository.findByApartmentIdAndReadingDate(
                dto.getApartmentId(), dto.getReadingDate()
        );
        WaterMeterReading entity = waterMeterMapper.toEntity(dto);
        if (existing.isPresent()) {
            entity.setId(existing.get().getId());
        }
        WaterMeterReading saved = waterMeterReadingRepository.save(entity);
        // Sau khi lưu, tính và cập nhật consumption dựa trên tháng trước
        updateConsumption(saved);
        saved = waterMeterReadingRepository.save(saved);
        WaterMeterReadingDto result = waterMeterMapper.toDto(saved);
        result.setApartmentName(apartmentService.getApartmentName(saved.getApartmentId().intValue()));
        // Set previousReading và currentReading cho frontend
        setReadingValues(result, saved);
        return result;
    }

    @Override
    public List<WaterMeterReadingDto> getAllReadings() {
        return waterMeterReadingRepository.findAll().stream()
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId().intValue()));
                    setReadingValues(dto, e);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<WaterMeterReadingDto> getReadingsByMonth(String month) {
        // Parse month string to LocalDate
        LocalDate monthDate = LocalDate.parse(month + "-01", DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return waterMeterReadingRepository.findAllByReadingDate(monthDate).stream()
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId().intValue()));
                    setReadingValues(dto, e);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<WaterMeterReadingDto> getWaterMetersByApartmentId(Long apartmentId) {
        return waterMeterReadingRepository.findAllByApartmentIdOrderByReadingDateDesc(apartmentId).stream()
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId().intValue()));
                    setReadingValues(dto, e);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Optional<WaterMeterReadingDto> getReadingById(Long id) {
        return waterMeterReadingRepository.findById(id)
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId().intValue()));
                    setReadingValues(dto, e);
                    return dto;
                });
    }

    @Override
    @Transactional
    public void deleteReading(Long id) {
        waterMeterReadingRepository.deleteById(id);
    }

    @Override
    @Transactional
    public WaterMeterReadingDto updateReading(Long id, WaterMeterReadingDto dto) {
        validateReading(dto);
        WaterMeterReading entity = waterMeterReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Water meter reading not found"));
        waterMeterMapper.updateEntityFromDto(dto, entity);
        WaterMeterReading saved = waterMeterReadingRepository.save(entity);
        // Sau khi cập nhật meterReading, cập nhật consumption
        updateConsumption(saved);
        WaterMeterReadingDto result = waterMeterMapper.toDto(saved);
        result.setApartmentName(apartmentService.getApartmentName(saved.getApartmentId().intValue()));
        setReadingValues(result, saved);
        return result;
    }

    @Override
    @Transactional
    public WaterMeterReadingDto patchReading(Long id, Map<String, Object> updates) {
        WaterMeterReading entity = waterMeterReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Water meter reading not found"));
        
        // Xử lý currentReading field
        if (updates.containsKey("currentReading")) {
            Object currentReadingValue = updates.get("currentReading");
            BigDecimal currentReading;
            if (currentReadingValue instanceof Number) {
                currentReading = new BigDecimal(currentReadingValue.toString());
            } else if (currentReadingValue instanceof String) {
                currentReading = new BigDecimal((String) currentReadingValue);
            } else {
                throw new IllegalArgumentException("Invalid currentReading value");
            }
            entity.setMeterReading(currentReading);
        }
        
        WaterMeterReading saved = waterMeterReadingRepository.save(entity);
        // Cập nhật consumption
        updateConsumption(saved);
        WaterMeterReadingDto result = waterMeterMapper.toDto(saved);
        result.setApartmentName(apartmentService.getApartmentName(saved.getApartmentId().intValue()));
        setReadingValues(result, saved);
        return result;
    }

    @Override
    @Transactional
    public void generateHistory(String startMonth) {
        // Tạo chỉ số nước từ tháng được chọn đến tháng hiện tại
        // Lấy tất cả apartment IDs từ ApartmentService thay vì chỉ từ water meter readings
        List<Long> apartmentIds = apartmentService.getAllApartments().stream()
                .map(apartment -> apartment.getId())
                .collect(Collectors.toList());
        
        // Lấy tháng hiện tại
        String currentMonth = java.time.YearMonth.now().toString(); // YYYY-MM
        
        // Tạo danh sách các tháng cần tạo (từ startMonth đến currentMonth)
        List<String> monthsToGenerate = generateMonthsList(startMonth, currentMonth);
        
        int createdCount = 0;
        for (Long apartmentId : apartmentIds) {
            for (String month : monthsToGenerate) {
                LocalDate monthDate = LocalDate.parse(month + "-01", DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                Optional<WaterMeterReading> exists = waterMeterReadingRepository.findByApartmentIdAndReadingDate(apartmentId, monthDate);
                if (exists.isEmpty()) {
                    // Lấy chỉ số mới thực tế của tháng trước đó (tìm ngược lại cho đến khi tìm được)
                    BigDecimal prevReading = findLastActualReading(apartmentId, month);
                    WaterMeterReading entity = new WaterMeterReading();
                    entity.setApartmentId(apartmentId);
                    entity.setReadingDate(monthDate);
                    entity.setMeterReading(BigDecimal.ZERO); // Mặc định là 0
                    entity.setConsumption(BigDecimal.ZERO);
                    entity.setRecordedBy(1L); // Default admin user
                    entity.setCreatedAt(java.time.LocalDateTime.now());
                    waterMeterReadingRepository.save(entity);
                    createdCount++;
                }
            }
        }
        
        System.out.println("DEBUG: Đã tạo " + createdCount + " chỉ số nước cho " + apartmentIds.size() + " căn hộ từ tháng " + startMonth + " đến " + currentMonth);
    }

    // Hàm tiện ích để set các giá trị reading cho frontend
    private void setReadingValues(WaterMeterReadingDto dto, WaterMeterReading entity) {
        dto.setCurrentReading(entity.getMeterReading());
        // Tìm previousReading từ tháng trước
        Optional<WaterMeterReading> previousReading = waterMeterReadingRepository
            .findTopByApartmentIdAndReadingDateLessThanOrderByReadingDateDesc(
                entity.getApartmentId(), entity.getReadingDate()
            );
        if (previousReading.isPresent()) {
            dto.setPreviousReading(previousReading.get().getMeterReading());
        } else {
            dto.setPreviousReading(BigDecimal.ZERO);
        }
    }

    // Hàm tiện ích lấy tháng trước theo định dạng YYYY-MM
    private String getPreviousMonth(String month) {
        java.time.YearMonth ym = java.time.YearMonth.parse(month);
        java.time.YearMonth prev = ym.minusMonths(1);
        return prev.toString(); // YYYY-MM
    }

    // Hàm tự động cập nhật consumption
    private void updateConsumption(WaterMeterReading reading) {
        // Tìm chỉ số của tháng trước (nếu không có, mặc định 0)
        Optional<WaterMeterReading> previousReading = waterMeterReadingRepository
            .findTopByApartmentIdAndReadingDateLessThanOrderByReadingDateDesc(
                reading.getApartmentId(), reading.getReadingDate()
            );

        BigDecimal previousMeterReading = previousReading
            .map(WaterMeterReading::getMeterReading)
            .orElse(BigDecimal.ZERO);

        BigDecimal currentMeterReading = reading.getMeterReading() != null
            ? reading.getMeterReading()
            : BigDecimal.ZERO;

        BigDecimal consumption = currentMeterReading.subtract(previousMeterReading);
        if (consumption.compareTo(BigDecimal.ZERO) < 0) {
            // Bảo vệ dữ liệu: không để tiêu thụ âm
            consumption = BigDecimal.ZERO;
        }
        reading.setConsumption(consumption);
    }

    // Hàm tiện ích lấy tháng sau theo định dạng YYYY-MM
    private String getNextMonth(String month) {
        java.time.YearMonth ym = java.time.YearMonth.parse(month);
        java.time.YearMonth next = ym.plusMonths(1);
        return next.toString(); // YYYY-MM
    }

    // Hàm tạo danh sách các tháng từ startMonth đến endMonth
    private List<String> generateMonthsList(String startMonth, String endMonth) {
        List<String> months = new ArrayList<>();
        java.time.YearMonth start = java.time.YearMonth.parse(startMonth);
        java.time.YearMonth end = java.time.YearMonth.parse(endMonth);
        
        java.time.YearMonth current = start;
        while (!current.isAfter(end)) {
            months.add(current.toString());
            current = current.plusMonths(1);
        }
        
        return months;
    }

    private void validateReading(WaterMeterReadingDto dto) {
        if (dto.getCurrentReading() != null && dto.getCurrentReading().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Chỉ số nước không được âm");
        }
    }

    private void normalizeIncomingDto(WaterMeterReadingDto dto) {
        // Nếu frontend gửi readingMonth (yyyy-MM) mà thiếu readingDate thì suy ra ngày 01 của tháng
        if (dto.getReadingDate() == null && dto.getReadingMonth() != null && !dto.getReadingMonth().isBlank()) {
            dto.setReadingDate(LocalDate.parse(dto.getReadingMonth() + "-01", DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }
        // Nếu thiếu meterReading thì lấy từ currentReading
        if (dto.getMeterReading() == null && dto.getCurrentReading() != null) {
            dto.setMeterReading(dto.getCurrentReading());
        }
        // Đồng bộ currentReading với meterReading để mapper không bị null
        if (dto.getCurrentReading() == null && dto.getMeterReading() != null) {
            dto.setCurrentReading(dto.getMeterReading());
        }
        // Tự động set recordedBy từ người dùng hiện tại nếu thiếu
        if (dto.getRecordedBy() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                Long uid = userService.getUserIdByPhoneNumber(auth.getName());
                if (uid != null) {
                    dto.setRecordedBy(uid);
                }
            }
            // Fallback an toàn cho môi trường test nếu không xác thực
            if (dto.getRecordedBy() == null) {
                dto.setRecordedBy(1L);
            }
        }
    }

    // Hàm tìm chỉ số mới thực tế xa nhất có thể
    private BigDecimal findLastActualReading(Long apartmentId, String month) {
        // Tìm tất cả bản ghi có tháng nhỏ hơn tháng hiện tại, sắp xếp theo tháng giảm dần
        List<WaterMeterReading> allReadings = waterMeterReadingRepository
            .findAllByApartmentIdOrderByReadingDateDesc(apartmentId);
        
        // Tìm chỉ số mới thực tế (meterReading > 0) xa nhất có thể
        for (WaterMeterReading reading : allReadings) {
            // Chỉ xét các tháng nhỏ hơn tháng hiện tại
            if (reading.getReadingDate().toString().compareTo(month + "-01") < 0 && 
                reading.getMeterReading().compareTo(BigDecimal.ZERO) > 0) {
                return reading.getMeterReading();
            }
        }
        
        return BigDecimal.ZERO; // Trả về 0 nếu không tìm thấy chỉ số thực tế nào
    }

    // --- STAFF helpers implementation ---
    @Override
    public Map<String, Object> lookupByApartmentCode(String apartmentCode) {
        // Tìm apartmentId theo unitNumber
        Long apartmentId = apartmentService.getAllApartments().stream()
                .filter(a -> a.getUnitNumber() != null && a.getUnitNumber().equalsIgnoreCase(apartmentCode))
                .map(a -> a.getId())
                .findFirst()
                .orElse(null);
        if (apartmentId == null) {
            throw new RuntimeException("Không tìm thấy căn hộ: " + apartmentCode);
        }
        List<WaterMeterReadingDto> list = getWaterMetersByApartmentId(apartmentId);
        Map<String, Object> m = new HashMap<>();
        m.put("apartmentId", apartmentId);
        m.put("apartmentName", apartmentService.getApartmentName(apartmentId.intValue()));
        if (!list.isEmpty()) {
            WaterMeterReadingDto latest = list.get(0);
            m.put("lastReading", latest.getCurrentReading());
            m.put("lastReadingAt", latest.getReadingDate() != null ? latest.getReadingDate().toString() : latest.getReadingMonth());
        }
        return m;
    }

    @Override
    @Transactional
    public WaterMeterReadingDto createFromApartmentCode(String apartmentCode, BigDecimal currentReading, LocalDate readingDate) {
        Long apartmentId = apartmentService.getAllApartments().stream()
                .filter(a -> a.getUnitNumber() != null && a.getUnitNumber().equalsIgnoreCase(apartmentCode))
                .map(a -> a.getId())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ: " + apartmentCode));
        WaterMeterReadingDto dto = new WaterMeterReadingDto();
        dto.setApartmentId(apartmentId);
        dto.setReadingDate(readingDate != null ? readingDate : LocalDate.now());
        dto.setCurrentReading(currentReading != null ? currentReading : BigDecimal.ZERO);
        dto.setMeterReading(dto.getCurrentReading());
        return addReading(dto);
    }
}
