import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(user: any): string {
  console.log("=== getAvatarUrl Debug ===");
  console.log("User object:", user);
  console.log("User avatarUrl:", user?.avatarUrl);
  
  if (user?.avatarUrl) {
    // Nếu avatarUrl bắt đầu bằng /api/files, sử dụng trực tiếp
    if (user.avatarUrl.startsWith('/api/files')) {
      console.log("Using direct API files URL:", user.avatarUrl);
      return user.avatarUrl;
    }
    // Nếu avatarUrl bắt đầu bằng /uploads/, thêm /api/files prefix
    if (user.avatarUrl.startsWith('/uploads/')) {
      const fullUrl = `/api/files${user.avatarUrl}`;
      console.log("Converting uploads URL to API files URL:", fullUrl);
      return fullUrl;
    }
    // Nếu đã có full URL, sử dụng trực tiếp
    if (user.avatarUrl.startsWith('http')) {
      console.log("Using full HTTP URL:", user.avatarUrl);
      return user.avatarUrl;
    }
  }
  
  // Fallback về placeholder
  console.log("Using fallback placeholder");
  console.log("=== End Debug ===");
  return '/placeholder-user.jpg';
} 