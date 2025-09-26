import React from 'react';
import { ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  className?: string;
  text?: string;
  subtext?: string;
}

export function ImagePlaceholder({ 
  className = "w-16 h-16", 
  text = "Lỗi tải ảnh",
  subtext = "Backend không khả dụng"
}: ImagePlaceholderProps) {
  return (
    <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-center p-2`}>
      <ImageIcon className="w-6 h-6 text-red-400 mb-1" />
      <span className="text-xs text-red-600 font-medium leading-tight">
        {text}
      </span>
      {subtext && (
        <span className="text-xs text-red-500 leading-tight">
          {subtext}
        </span>
      )}
    </div>
  );
}

export default ImagePlaceholder;
