package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.FacilityCreateRequest;
import com.mytech.apartment.portal.dtos.FacilityDto;
import com.mytech.apartment.portal.dtos.FacilityUpdateRequest;
import com.mytech.apartment.portal.mappers.FacilityMapper;
import com.mytech.apartment.portal.models.Facility;
import com.mytech.apartment.portal.repositories.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacilityService {
    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private FacilityMapper facilityMapper;

    public List<FacilityDto> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(facilityMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<FacilityDto> getVisibleFacilities() {
        // Trả về chỉ những facilities có isVisible = true (cho residents)
        return facilityRepository.findByIsVisibleTrue().stream()
                .map(facilityMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<FacilityDto> getFacilityById(Long id) {
        return facilityRepository.findById(id).map(facilityMapper::toDto);
    }

    public FacilityDto createFacility(FacilityCreateRequest request) {
        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        facility.setLocation(request.getLocation());
        facility.setCapacity(request.getCapacity());
        facility.setCapacityType(request.getCapacityType());
        facility.setGroupSize(request.getGroupSize());
        facility.setOtherDetails(request.getOtherDetails());
        facility.setUsageFee(request.getUsageFee());
        
        // Xử lý openingSchedule trước
        String openingSchedule = null;
        if (request.getOpeningSchedule() != null && !request.getOpeningSchedule().trim().isEmpty()) {
            openingSchedule = request.getOpeningSchedule();
        } else {
            // Tạo lịch mặc định nếu không có
            openingSchedule = "{\"mon\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"},\"tue\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"},\"wed\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"},\"thu\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"},\"fri\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"},\"sat\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"},\"sun\":{\"open\":true,\"from\":\"06:00\",\"to\":\"22:00\"}}";
        }
        facility.setOpeningSchedule(openingSchedule);
        
        // Tạo openingHours từ openingSchedule nếu không có
        String openingHours = request.getOpeningHours();
        if (openingHours == null || openingHours.trim().isEmpty()) {
            openingHours = generateOpeningHoursFromSchedule(openingSchedule);
        }
        facility.setOpeningHours(openingHours);
        
        facility.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);

        Facility savedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(savedFacility);
    }

    // Hàm tạo openingHours từ openingSchedule JSON
    private String generateOpeningHoursFromSchedule(String openingScheduleJson) {
        try {
            // Parse JSON để tạo openingHours
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode schedule = mapper.readTree(openingScheduleJson);
            
            java.util.List<String> openDays = new java.util.ArrayList<>();
            boolean allDaysSame = true;
            String firstDayTime = null;
            
            String[] dayNames = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"};
            String[] dayLabels = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};
            
            for (int i = 0; i < dayNames.length; i++) {
                String day = dayNames[i];
                if (schedule.has(day)) {
                    com.fasterxml.jackson.databind.JsonNode daySchedule = schedule.get(day);
                    if (daySchedule.has("open") && daySchedule.get("open").asBoolean()) {
                        String from = daySchedule.has("from") ? daySchedule.get("from").asText() : "06:00";
                        String to = daySchedule.has("to") ? daySchedule.get("to").asText() : "22:00";
                        String dayTime = from + "-" + to;
                        openDays.add(dayLabels[i] + ": " + dayTime);
                        
                        if (firstDayTime == null) {
                            firstDayTime = dayTime;
                        } else if (!firstDayTime.equals(dayTime)) {
                            allDaysSame = false;
                        }
                    }
                }
            }
            
            if (openDays.isEmpty()) {
                return "Đóng cửa";
            } else if (allDaysSame && openDays.size() == 7 && firstDayTime != null) {
                return firstDayTime.replace("-", " - ");
            } else {
                return String.join(", ", openDays);
            }
        } catch (Exception e) {
            // Nếu có lỗi parse JSON, trả về giờ mặc định
            return "06:00 - 22:00";
        }
    }

    public FacilityDto updateFacility(Long id, FacilityUpdateRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + id));

        if (request.getName() != null) {
            facility.setName(request.getName());
        }
        if (request.getDescription() != null) {
            facility.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            facility.setLocation(request.getLocation());
        }
        if (request.getCapacity() != null) {
            facility.setCapacity(request.getCapacity());
        }
        if (request.getCapacityType() != null) {
            facility.setCapacityType(request.getCapacityType());
        }
        if (request.getGroupSize() != null) {
            facility.setGroupSize(request.getGroupSize());
        }
        if (request.getOtherDetails() != null) {
            facility.setOtherDetails(request.getOtherDetails());
        }
        if (request.getUsageFee() != null) {
            facility.setUsageFee(request.getUsageFee());
        }
        
        // Xử lý openingSchedule và openingHours
        if (request.getOpeningSchedule() != null && !request.getOpeningSchedule().trim().isEmpty()) {
            facility.setOpeningSchedule(request.getOpeningSchedule());
            // Tự động cập nhật openingHours từ openingSchedule
            String newOpeningHours = generateOpeningHoursFromSchedule(request.getOpeningSchedule());
            facility.setOpeningHours(newOpeningHours);
        } else if (request.getOpeningHours() != null && !request.getOpeningHours().trim().isEmpty()) {
            // Nếu chỉ có openingHours mà không có openingSchedule
            facility.setOpeningHours(request.getOpeningHours());
        }
        if (request.getIsVisible() != null) {
            facility.setIsVisible(request.getIsVisible());
        }

        Facility updatedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(updatedFacility);
    }

    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found with id " + id);
        }
        facilityRepository.deleteById(id);
    }

    public FacilityDto toggleFacilityVisibility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + id));
        
        // Toggle visibility
        facility.setIsVisible(!facility.getIsVisible());
        
        Facility updatedFacility = facilityRepository.save(facility);
        return facilityMapper.toDto(updatedFacility);
    }
} 