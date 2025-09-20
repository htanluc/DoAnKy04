package com.mytech.apartment.portal.dtos;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

public class FacilityBookingCreateRequest {
    @NotNull(message = "facilityId không được để trống")
    private Long facilityId;
    
    private Long userId;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @NotBlank(message = "purpose không được để trống")
    private String purpose;
    
    @NotBlank(message = "bookingTime không được để trống")
    private String bookingTime; // Thay đổi từ LocalDateTime sang String
    
    @NotNull(message = "duration không được để trống")
    @Min(value = 30, message = "Thời lượng tối thiểu là 30 phút")
    private Integer duration;
    
    @NotNull(message = "numberOfPeople không được để trống")
    @Min(value = 1, message = "Số người phải lớn hơn 0")
    private Integer numberOfPeople;
    
    // Payment fields
    private String paymentStatus;
    private String paymentMethod;
    private Double totalCost;
    private String transactionId;

    // Constructors
    public FacilityBookingCreateRequest() {}

    public FacilityBookingCreateRequest(Long facilityId, Long userId, LocalDateTime startTime, LocalDateTime endTime, String purpose) {
        this.facilityId = facilityId;
        this.userId = userId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
    }

    // Getters and Setters
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getBookingTime() { return bookingTime; }
    public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public Integer getNumberOfPeople() { return numberOfPeople; }
    public void setNumberOfPeople(Integer numberOfPeople) { this.numberOfPeople = numberOfPeople; }

    // Payment getters and setters
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
} 