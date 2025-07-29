"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  onImagesRemoved: (urls: string[]) => void;
  uploadedUrls: string[];
  maxImages?: number;
  endpoint: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function ImageUpload({
  onImagesUploaded,
  onImagesRemoved,
  uploadedUrls,
  maxImages = 5,
  endpoint,
  title = "Upload hình ảnh",
  description = "Kéo thả hoặc click để chọn file",
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImages = async (files: FileList): Promise<string[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('file', file);
    });

    const response = await fetch(`http://localhost:8080${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload thất bại: ${errorText}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    if (result.success && result.data) {
      // For single image upload (avatar)
      return Array.isArray(result.data) ? result.data : [result.data];
    } else if (Array.isArray(result)) {
      // For multiple image upload (vehicles)
      return result;
    } else {
      throw new Error('Response format không hợp lệ');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedUrls.length + files.length > maxImages) {
      alert(`Chỉ có thể upload tối đa ${maxImages} hình ảnh`);
      return;
    }

    setIsUploading(true);
    try {
      const newUrls = await uploadImages(files);
      onImagesUploaded(newUrls);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (uploadedUrls.length + files.length > maxImages) {
        alert(`Chỉ có thể upload tối đa ${maxImages} hình ảnh`);
        return;
      }

      setIsUploading(true);
      try {
        const newUrls = await uploadImages(files);
        onImagesUploaded(newUrls);
      } catch (error) {
        console.error('Upload error:', error);
        alert(error instanceof Error ? error.message : 'Upload thất bại');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    onImagesRemoved([uploadedUrls[index]]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
          title="Chọn file hình ảnh"
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang upload...</span>
              </div>
            ) : (
              <>
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click để chọn file
                </span>
                {' '}hoặc kéo thả vào đây
              </>
            )}
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF tối đa {maxImages} file
          </p>
        </div>
      </div>

      {/* Uploaded Images */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Hình ảnh đã upload ({uploadedUrls.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    console.error('Failed to load image:', url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 