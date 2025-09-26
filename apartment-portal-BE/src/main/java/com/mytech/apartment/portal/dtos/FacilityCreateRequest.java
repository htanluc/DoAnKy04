package com.mytech.apartment.portal.dtos;

public class FacilityCreateRequest {
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private String capacityType; // INDIVIDUAL hoặc GROUP
    private Integer groupSize; // Số lượng người trong nhóm (chỉ dùng khi capacityType = GROUP)
    private String otherDetails;
    private Double usageFee;
    private String openingHours;
    private String openingSchedule; // JSON string cho lịch mở cửa theo tuần
    private Boolean isVisible = true;

    // Constructors
    public FacilityCreateRequest() {}

    public FacilityCreateRequest(String name, String description, String location, Integer capacity, String otherDetails) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.capacity = capacity;
        this.otherDetails = otherDetails;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getOtherDetails() { return otherDetails; }
    public void setOtherDetails(String otherDetails) { this.otherDetails = otherDetails; }

    public Double getUsageFee() { return usageFee; }
    public void setUsageFee(Double usageFee) { this.usageFee = usageFee; }

    public String getCapacityType() { return capacityType; }
    public void setCapacityType(String capacityType) { this.capacityType = capacityType; }

    public Integer getGroupSize() { return groupSize; }
    public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getOpeningSchedule() { return openingSchedule; }
    public void setOpeningSchedule(String openingSchedule) { this.openingSchedule = openingSchedule; }

    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
} 