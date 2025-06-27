package com.mytech.apartment.portal.dtos;

public class FeedbackUpdateRequest {
    private String status;
    private String response;

    // Constructors
    public FeedbackUpdateRequest() {}

    public FeedbackUpdateRequest(String status, String response) {
        this.status = status;
        this.response = response;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
} 