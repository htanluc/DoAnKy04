package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.mappers.WaterMeterMapper;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
                                 ApartmentService apartmentService) {
        this.waterMeterReadingRepository = waterMeterReadingRepository;
        this.waterMeterMapper = waterMeterMapper;
        this.apartmentService = apartmentService;
    }

    @Override
    @Transactional
    public WaterMeterReadingDto addReading(WaterMeterReadingDto dto) {
        validateReading(dto);
        // Kiểm tra đã có reading cho apartment + month chưa
        Optional<WaterMeterReading> existing = waterMeterReadingRepository.findByApartmentIdAndReadingMonth(
                dto.getApartmentId(), dto.getReadingMonth()
        );
        WaterMeterReading entity = waterMeterMapper.toEntity(dto);
        if (existing.isPresent()) {
            entity.setReadingId(existing.get().getReadingId());
        }
        WaterMeterReading saved = waterMeterReadingRepository.save(entity);
        WaterMeterReadingDto result = waterMeterMapper.toDto(saved);
        result.setApartmentName(apartmentService.getApartmentName(saved.getApartmentId()));
        return result;
    }

    @Override
    public List<WaterMeterReadingDto> getAllReadings() {
        return waterMeterReadingRepository.findAll().stream()
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<WaterMeterReadingDto> getReadingsByMonth(String month) {
        return waterMeterReadingRepository.findAllByReadingMonth(month).stream()
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Optional<WaterMeterReadingDto> getReadingById(Long id) {
        return waterMeterReadingRepository.findById(id)
                .map(e -> {
                    WaterMeterReadingDto dto = waterMeterMapper.toDto(e);
                    dto.setApartmentName(apartmentService.getApartmentName(e.getApartmentId()));
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
        // Sau khi cập nhật currentReading, cập nhật previousReading của tháng sau (nếu có)
        updateNextMonthPreviousReading(saved.getApartmentId(), saved.getReadingMonth(), saved.getCurrentReading());
        WaterMeterReadingDto result = waterMeterMapper.toDto(saved);
        result.setApartmentName(apartmentService.getApartmentName(saved.getApartmentId()));
        return result;
    }

    @Override
    @Transactional
    public WaterMeterReadingDto patchReading(Long id, Map<String, Object> updates) {
        WaterMeterReading entity = waterMeterReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Water meter reading not found"));
        if (updates.containsKey("previousReading")) {
            entity.setPreviousReading(new BigDecimal(updates.get("previousReading").toString()));
        }
        boolean updateCurrent = false;
        if (updates.containsKey("currentReading")) {
            entity.setCurrentReading(new BigDecimal(updates.get("currentReading").toString()));
            updateCurrent = true;
        }
        // Có thể patch các trường khác nếu cần
        WaterMeterReading saved = waterMeterReadingRepository.save(entity);
        // Nếu có cập nhật currentReading thì cập nhật previousReading của tháng sau
        if (updateCurrent) {
            updateNextMonthPreviousReading(saved.getApartmentId(), saved.getReadingMonth(), saved.getCurrentReading());
        }
        WaterMeterReadingDto result = waterMeterMapper.toDto(saved);
        result.setApartmentName(apartmentService.getApartmentName(saved.getApartmentId()));
        return result;
    }

    @Override
    @Transactional
    public void generateHistory(String startMonth) {
        // Tạo chỉ số nước từ tháng được chọn đến tháng hiện tại
        List<Integer> apartmentIds = waterMeterReadingRepository.findDistinctApartmentIds();
        
        // Lấy tháng hiện tại
        String currentMonth = java.time.YearMonth.now().toString(); // YYYY-MM
        
        // Tạo danh sách các tháng cần tạo (từ startMonth đến currentMonth)
        List<String> monthsToGenerate = generateMonthsList(startMonth, currentMonth);
        
        for (Integer apartmentId : apartmentIds) {
            for (String month : monthsToGenerate) {
                Optional<WaterMeterReading> exists = waterMeterReadingRepository.findByApartmentIdAndReadingMonth(apartmentId, month);
                if (exists.isEmpty()) {
                    // Lấy chỉ số mới thực tế của tháng trước đó (tìm ngược lại cho đến khi tìm được)
                    BigDecimal prevReading = findLastActualReading(apartmentId, month);
                    WaterMeterReading entity = new WaterMeterReading();
                    entity.setApartmentId(apartmentId);
                    entity.setReadingMonth(month);
                    entity.setPreviousReading(prevReading);
                    entity.setCurrentReading(BigDecimal.ZERO); // Mặc định là 0
                    entity.setCreatedAt(java.time.LocalDateTime.now());
                    waterMeterReadingRepository.save(entity);
                }
            }
        }
    }

    // Hàm tiện ích lấy tháng trước theo định dạng YYYY-MM
    private String getPreviousMonth(String month) {
        java.time.YearMonth ym = java.time.YearMonth.parse(month);
        java.time.YearMonth prev = ym.minusMonths(1);
        return prev.toString(); // YYYY-MM
    }

    // Hàm tự động cập nhật previousReading của tháng sau
    private void updateNextMonthPreviousReading(Integer apartmentId, String currentMonth, BigDecimal newCurrentReading) {
        String nextMonth = getNextMonth(currentMonth);
        Optional<WaterMeterReading> next = waterMeterReadingRepository.findByApartmentIdAndReadingMonth(apartmentId, nextMonth);
        if (next.isPresent()) {
            WaterMeterReading nextEntity = next.get();
            nextEntity.setPreviousReading(newCurrentReading);
            // KHÔNG reset hoặc thay đổi currentReading tháng sau!
            waterMeterReadingRepository.save(nextEntity);
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
        if (dto.getCurrentReading().compareTo(dto.getPreviousReading()) < 0) {
            throw new IllegalArgumentException("Chỉ số mới không được nhỏ hơn chỉ số cũ");
        }
    }

    // Hàm tìm chỉ số mới thực tế xa nhất có thể
    private BigDecimal findLastActualReading(Integer apartmentId, String month) {
        // Tìm tất cả bản ghi có tháng nhỏ hơn tháng hiện tại, sắp xếp theo tháng giảm dần
        List<WaterMeterReading> allReadings = waterMeterReadingRepository
            .findAllByApartmentIdOrderByReadingMonthDesc(apartmentId);
        
        // Tìm chỉ số mới thực tế (currentReading > 0) xa nhất có thể
        for (WaterMeterReading reading : allReadings) {
            // Chỉ xét các tháng nhỏ hơn tháng hiện tại
            if (reading.getReadingMonth().compareTo(month) < 0 && 
                reading.getCurrentReading().compareTo(BigDecimal.ZERO) > 0) {
                return reading.getCurrentReading();
            }
        }
        
        return BigDecimal.ZERO; // Trả về 0 nếu không tìm thấy chỉ số thực tế nào
    }

    /**
     * Get water meter readings by apartment ID
     * Lấy danh sách chỉ số nước theo ID căn hộ
     */
    public List<WaterMeterReadingDto> getWaterMetersByApartmentId(Long apartmentId) {
        return waterMeterReadingRepository.findAllByApartmentIdOrderByReadingMonthDesc(apartmentId.intValue()).stream()
                .map(waterMeterMapper::toDto)
                .collect(Collectors.toList());
    }
} 