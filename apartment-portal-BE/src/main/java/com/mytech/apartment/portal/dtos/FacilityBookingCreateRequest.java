package com.mytech.apartment.portal.dtos;

import java.time.LocalDateTime;

public class FacilityBookingCreateRequest {
    private Long facilityId;
    private Long residentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private LocalDateTime bookingTime;
    private Integer duration;
    private Integer numberOfPeople;

    // Constructors
    public FacilityBookingCreateRequest() {}

    public FacilityBookingCreateRequest(Long facilityId, Long residentId, LocalDateTime startTime, LocalDateTime endTime, String purpose) {
        this.facilityId = facilityId;
        this.residentId = residentId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
    }

    // Getters and Setters
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }

    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getNumberOfPeople() { return numberOfPeople; }
    public void setNumberOfPeople(Integer numberOfPeople) { this.numberOfPeople = numberOfPeople; }
} 