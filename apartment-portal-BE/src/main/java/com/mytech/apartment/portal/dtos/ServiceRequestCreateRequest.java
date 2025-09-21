package com.mytech.apartment.portal.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ServiceRequestCreateRequest {
    // userId sẽ được set tự động từ authentication, không cần validation
    private Long userId;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 5, max = 1000, message = "Description must be between 5 and 1000 characters")
    private String description;
    
    private String priority;
    
    private List<String> attachmentUrls; // URLs của các file đã upload
    private List<String> imageAttachment; // URLs của các hình ảnh đã upload

    // Constructors
    public ServiceRequestCreateRequest() {}

    public ServiceRequestCreateRequest(Long userId, Long categoryId, String title, String description, String priority) {
        this.userId = userId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.priority = priority;
    }

    public ServiceRequestCreateRequest(Long userId, Long categoryId, String title, String description, String priority, List<String> attachmentUrls) {
        this.userId = userId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.attachmentUrls = attachmentUrls;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> attachmentUrls) { this.attachmentUrls = attachmentUrls; }

    public List<String> getImageAttachment() { return imageAttachment; }
    public void setImageAttachment(List<String> imageAttachment) { this.imageAttachment = imageAttachment; }
} 