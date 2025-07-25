package com.mytech.apartment.portal.dtos;

import java.time.LocalDateTime;

public class FeedbackDto {
    private Long id;
    private Long residentId;
    private String residentName;
    private String categoryId;
    private String categoryName;
    private String title;
    private String content;
    private Integer rating;
    private String status;
    private String response;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public FeedbackDto() {}

    public FeedbackDto(Long id, Long residentId, String residentName, String categoryId, String categoryName,
                      String title, String content, Integer rating, String status, String response,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.residentId = residentId;
        this.residentName = residentName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.title = title;
        this.content = content;
        this.rating = rating;
        this.status = status;
        this.response = response;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String residentName) { this.residentName = residentName; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 