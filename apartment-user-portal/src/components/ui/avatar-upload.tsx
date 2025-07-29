"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { X, Upload, User } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUploaded: (url: string) => void;
  onAvatarRemoved: () => void;
  className?: string;
}

export default function AvatarUpload({
  currentAvatarUrl,
  onAvatarUploaded,
  onAvatarRemoved,
  className = ""
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadAvatar = async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8080/api/auth/upload/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload avatar thất bại: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error('Response format không hợp lệ');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ có thể upload file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Kích thước tối đa là 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      onAvatarUploaded(avatarUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload avatar thất bại');
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

    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Chỉ có thể upload file hình ảnh');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn. Kích thước tối đa là 5MB');
        return;
      }

      setIsUploading(true);
      try {
        const avatarUrl = await uploadAvatar(file);
        onAvatarUploaded(avatarUrl);
      } catch (error) {
        console.error('Upload error:', error);
        alert(error instanceof Error ? error.message : 'Upload avatar thất bại');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeAvatar = () => {
    onAvatarRemoved();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
        <p className="text-sm text-gray-600">Upload ảnh đại diện cho tài khoản của bạn</p>
      </div>

      <div className="flex items-center space-x-6">
        {/* Current Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={currentAvatarUrl} 
              alt="Avatar"
              onError={(e) => {
                console.error('Failed to load avatar:', currentAvatarUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
            <AvatarFallback className="w-24 h-24 text-2xl">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
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
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
              title="Chọn ảnh đại diện"
            />
            
            <div className="space-y-2">
              <Upload className="mx-auto h-6 w-6 text-gray-400" />
              <div className="text-sm text-gray-600">
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click để chọn ảnh
                    </span>
                    {' '}hoặc kéo thả vào đây
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF tối đa 5MB
              </p>
            </div>
          </div>

          {/* Remove Button */}
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              className="mt-2 w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa ảnh đại diện
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 