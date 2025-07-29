package com.mytech.apartment.portal.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final String UPLOAD_DIR = "uploads/vehicles/";

    public String uploadVehicleImage(MultipartFile file) throws IOException {
        // Tạo thư mục nếu chưa tồn tại
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file unique
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + fileExtension;

        // Lưu file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Trả về URL tương đối
        return "/uploads/vehicles/" + filename;
    }

    public String[] uploadMultipleVehicleImages(MultipartFile[] files) throws IOException {
        String[] uploadedUrls = new String[files.length];
        
        for (int i = 0; i < files.length; i++) {
            uploadedUrls[i] = uploadVehicleImage(files[i]);
        }
        
        return uploadedUrls;
    }
} 