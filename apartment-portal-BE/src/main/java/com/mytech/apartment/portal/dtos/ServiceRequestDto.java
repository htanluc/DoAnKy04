package com.mytech.apartment.portal.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class ServiceRequestDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userPhone;
    private String categoryId;
    private String categoryName;
    private String title;
    private String description;
    private String priority;
    private String status;
    private String assignedTo;
    private Long assignedToId;
    private String assignedToPhone;
    private String resolution;
    private List<String> attachmentUrls; // URLs của các file đính kèm
    private List<String> imageUrls; // URLs của các hình ảnh
    private List<String> beforeImages; // Ảnh chụp trước khi sửa
    private List<String> afterImages;  // Ảnh chụp sau khi sửa
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    // Constructors
    public ServiceRequestDto() {}

    public ServiceRequestDto(Long id, Long userId, String userName, String userPhone, String categoryId, String categoryName,
                           String title, String description, String priority, String status, String assignedTo,
                           String resolution, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.assignedTo = assignedTo;
        this.resolution = resolution;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
    }

    public ServiceRequestDto(Long id, Long userId, String userName, String userPhone, String categoryId, String categoryName,
                           String title, String description, String priority, String status, String assignedTo,
                           Long assignedToId, String assignedToPhone, String resolution, List<String> attachmentUrls, List<String> imageUrls,
                           List<String> beforeImages, List<String> afterImages,
                           LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.assignedTo = assignedTo;
        this.assignedToId = assignedToId;
        this.assignedToPhone = assignedToPhone;
        this.resolution = resolution;
        this.attachmentUrls = attachmentUrls;
        this.imageUrls = imageUrls;
        this.beforeImages = beforeImages;
        this.afterImages = afterImages;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToPhone() { return assignedToPhone; }
    public void setAssignedToPhone(String assignedToPhone) { this.assignedToPhone = assignedToPhone; }

    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> attachmentUrls) { this.attachmentUrls = attachmentUrls; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public List<String> getBeforeImages() { return beforeImages; }
    public void setBeforeImages(List<String> beforeImages) { this.beforeImages = beforeImages; }

    public List<String> getAfterImages() { return afterImages; }
    public void setAfterImages(List<String> afterImages) { this.afterImages = afterImages; }
} 