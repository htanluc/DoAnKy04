package com.mytech.apartment.portal.dtos;

public class ServiceRequestUpdateRequest {
    private String status;
    private String assignedTo;
    private String resolution;

    // Constructors
    public ServiceRequestUpdateRequest() {}

    public ServiceRequestUpdateRequest(String status, String assignedTo, String resolution) {
        this.status = status;
        this.assignedTo = assignedTo;
        this.resolution = resolution;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
} 