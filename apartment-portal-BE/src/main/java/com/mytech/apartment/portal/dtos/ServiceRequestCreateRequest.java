package com.mytech.apartment.portal.dtos;

public class ServiceRequestCreateRequest {
    private Long residentId;
    private Long categoryId;
    private String title;
    private String description;
    private String priority;

    // Constructors
    public ServiceRequestCreateRequest() {}

    public ServiceRequestCreateRequest(Long residentId, Long categoryId, String title, String description, String priority) {
        this.residentId = residentId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.priority = priority;
    }

    // Getters and Setters
    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
} 