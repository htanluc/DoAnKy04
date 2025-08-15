package com.mytech.apartment.portal.dtos;

import java.time.LocalDateTime;

public class FacilityBookingDto {
    private Long id;
    private Long facilityId;
    private String facilityName;
    private Long userId;
    private String userName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String purpose;
    private LocalDateTime createdAt;
    private Double totalCost;
    private Integer numberOfPeople;
    
    // QR Code fields
    private String qrCode;
    private LocalDateTime qrExpiresAt;
    private Integer checkedInCount;
    private Integer maxCheckins;

    // Constructors
    public FacilityBookingDto() {}

    public FacilityBookingDto(Long id, Long facilityId, String facilityName, Long userId, String userName, 
                             LocalDateTime startTime, LocalDateTime endTime, String status, String purpose, LocalDateTime createdAt) {
        this.id = id;
        this.facilityId = facilityId;
        this.facilityName = facilityName;
        this.userId = userId;
        this.userName = userName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.purpose = purpose;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }
    public Integer getNumberOfPeople() { return numberOfPeople; }
    public void setNumberOfPeople(Integer numberOfPeople) { this.numberOfPeople = numberOfPeople; }
    
    // QR Code getters and setters
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    
    public LocalDateTime getQrExpiresAt() { return qrExpiresAt; }
    public void setQrExpiresAt(LocalDateTime qrExpiresAt) { this.qrExpiresAt = qrExpiresAt; }
    
    public Integer getCheckedInCount() { return checkedInCount; }
    public void setCheckedInCount(Integer checkedInCount) { this.checkedInCount = checkedInCount; }
    
    public Integer getMaxCheckins() { return maxCheckins; }
    public void setMaxCheckins(Integer maxCheckins) { this.maxCheckins = maxCheckins; }
    
    // Payment fields
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String transactionId;
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
} 