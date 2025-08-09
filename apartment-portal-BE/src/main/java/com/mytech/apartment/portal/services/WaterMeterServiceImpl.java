package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.mappers.WaterMeterMapper;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class WaterMeterServiceImpl implements WaterMeterService {
    private final WaterMeterReadingRepository waterMeterReadingRepository;
    private final WaterMeterMapper waterMeterMapper;
    private final ApartmentService apartmentService;

    @Autowired
    public WaterMeterServiceImpl(WaterMeterReadingRepository waterMeterReadingRepository,
                                 WaterMeterMapper waterMeterMapper,
                                 @Lazy ApartmentService apartmentService) {
        this.waterMeterReadingRepository = waterMeterReadingRepository;
        this.waterMeterMapper = waterMeterMapper;
        this.apartmentService = apartmentService;
    }

    @Override
    @Transactional
    public WaterMeterReadingDto addReading(WaterMeterReadingDto dto) {
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
        // Tìm chỉ số của tháng trước
        Optional<WaterMeterReading> previousReading = waterMeterReadingRepository
            .findTopByApartmentIdAndReadingDateLessThanOrderByReadingDateDesc(
                reading.getApartmentId(), reading.getReadingDate()
            );
        
        if (previousReading.isPresent()) {
            BigDecimal previousMeterReading = previousReading.get().getMeterReading();
            BigDecimal currentMeterReading = reading.getMeterReading();
            BigDecimal consumption = currentMeterReading.subtract(previousMeterReading);
            if (consumption.compareTo(BigDecimal.ZERO) >= 0) {
                reading.setConsumption(consumption);
            }
        }
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
}
