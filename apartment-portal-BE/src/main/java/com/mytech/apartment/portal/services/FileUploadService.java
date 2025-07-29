package com.mytech.apartment.portal.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.path:uploads}")
    private String uploadPath;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Upload file to server
     * Upload file lên server
     */
    public String uploadFile(MultipartFile file, String folder, Long userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        if (!isAllowedFileType(fileExtension)) {
            throw new IllegalArgumentException("File type not allowed: " + fileExtension);
        }

        // Create directory structure
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String userFolder = "user_" + userId;
        String targetFolder = uploadPath + "/" + folder + "/" + userFolder + "/" + timestamp;
        
        Path targetPath = Paths.get(targetFolder);
        if (!Files.exists(targetPath)) {
            Files.createDirectories(targetPath);
        }

        // Generate unique filename
        String uniqueFilename = generateUniqueFilename(originalFilename);
        Path filePath = targetPath.resolve(uniqueFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Return file URL
        return baseUrl + "/api/files/" + folder + "/" + userFolder + "/" + timestamp + "/" + uniqueFilename;
    }

    /**
     * Delete file from server
     * Xóa file khỏi server
     */
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            throw new IllegalArgumentException("File URL is empty");
        }

        // Extract file path from URL
        String filePath = extractFilePathFromUrl(fileUrl);
        if (filePath == null) {
            throw new IllegalArgumentException("Invalid file URL");
        }

        Path path = Paths.get(uploadPath, filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        } else {
            throw new IllegalArgumentException("File not found: " + filePath);
        }
    }

    /**
     * Get file extension
     * Lấy phần mở rộng file
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex + 1).toLowerCase();
        }
        return "";
    }

    /**
     * Check if file type is allowed
     * Kiểm tra loại file có được phép không
     */
    private boolean isAllowedFileType(String fileExtension) {
        String[] allowedExtensions = {
            // Images
            "jpg", "jpeg", "png", "gif", "bmp", "webp",
            // Videos
            "mp4", "avi", "mov", "wmv", "flv", "webm",
            // Documents
            "pdf", "doc", "docx", "txt",
            // Archives
            "zip", "rar"
        };

        for (String ext : allowedExtensions) {
            if (ext.equals(fileExtension)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate unique filename
     * Tạo tên file duy nhất
     */
    private String generateUniqueFilename(String originalFilename) {
        String fileExtension = getFileExtension(originalFilename);
        String baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        return baseName + "_" + timestamp + "_" + uuid + "." + fileExtension;
    }

    /**
     * Extract file path from URL
     * Trích xuất đường dẫn file từ URL
     */
    private String extractFilePathFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }

        // Remove base URL
        if (fileUrl.startsWith(baseUrl)) {
            fileUrl = fileUrl.substring(baseUrl.length());
        }

        // Remove API path
        if (fileUrl.startsWith("/api/files/")) {
            fileUrl = fileUrl.substring("/api/files/".length());
        }

        return fileUrl;
    }

    /**
     * Get file size in human readable format
     * Lấy kích thước file theo định dạng dễ đọc
     */
    public String getFileSizeInReadableFormat(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        } else if (bytes < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        } else {
            return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
        }
    }

    /**
     * Check if file is image
     * Kiểm tra file có phải là hình ảnh không
     */
    public boolean isImageFile(String fileUrl) {
        String extension = getFileExtension(fileUrl);
        String[] imageExtensions = {"jpg", "jpeg", "png", "gif", "bmp", "webp"};
        
        for (String ext : imageExtensions) {
            if (ext.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if file is video
     * Kiểm tra file có phải là video không
     */
    public boolean isVideoFile(String fileUrl) {
        String extension = getFileExtension(fileUrl);
        String[] videoExtensions = {"mp4", "avi", "mov", "wmv", "flv", "webm"};
        
        for (String ext : videoExtensions) {
            if (ext.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Upload service request image
     */
    public String uploadServiceRequestImage(MultipartFile file) throws IOException {
        // For now, use a default user ID of 1 for service request images
        return uploadFile(file, "service-requests", 1L);
    }

    /**
     * Upload avatar image
     */
    public String uploadAvatarImage(MultipartFile file) throws IOException {
        // For now, use a default user ID of 1 for avatar images
        return uploadFile(file, "avatars", 1L);
    }

    /**
     * Upload vehicle image
     */
    public String uploadVehicleImage(MultipartFile file) throws IOException {
        // For now, use a default user ID of 1 for vehicle images
        return uploadFile(file, "vehicles", 1L);
    }

    /**
     * Upload multiple vehicle images
     */
    public String[] uploadMultipleVehicleImages(MultipartFile[] files) throws IOException {
        String[] imageUrls = new String[files.length];
        for (int i = 0; i < files.length; i++) {
            imageUrls[i] = uploadVehicleImage(files[i]);
        }
        return imageUrls;
    }
} 