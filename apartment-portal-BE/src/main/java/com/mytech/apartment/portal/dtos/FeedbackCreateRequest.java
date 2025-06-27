package com.mytech.apartment.portal.dtos;

public class FeedbackCreateRequest {
    private Long residentId;
    private String categoryId;
    private String title;
    private String content;
    private Integer rating;

    // Constructors
    public FeedbackCreateRequest() {}

    public FeedbackCreateRequest(Long residentId, String categoryId, String title, String content, Integer rating) {
        this.residentId = residentId;
        this.categoryId = categoryId;
        this.title = title;
        this.content = content;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
} 