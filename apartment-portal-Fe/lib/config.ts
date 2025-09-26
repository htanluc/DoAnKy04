// Cấu hình ứng dụng
export const config = {
  // API Base URL - ưu tiên environment variable, fallback về localhost
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  
  // Các cấu hình khác
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Apartment Portal',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Cấu hình image proxy
  IMAGE_PROXY_ENABLED: process.env.NEXT_PUBLIC_IMAGE_PROXY_ENABLED !== 'false',
  
  // Debug mode
  DEBUG: process.env.NODE_ENV === 'development',
};

// Helper function để build image URL
export const buildImageUrl = (rawUrl: string, token?: string): string => {
  if (!rawUrl || !rawUrl.trim()) return '';
  
  // Luôn sử dụng image proxy để tránh vấn đề CORS và đảm bảo token được gửi
  if (config.IMAGE_PROXY_ENABLED) {
    const encoded = encodeURIComponent(rawUrl);
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    return `/api/image-proxy?url=${encoded}${tokenParam}`;
  }
  
  // Fallback: build URL trực tiếp với API_BASE_URL
  const baseUrl = rawUrl.startsWith('http') ? '' : config.API_BASE_URL;
  return `${baseUrl}${rawUrl}`;
};

// Helper function để lấy token từ localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Helper function để build image URL với token tự động
export const buildImageUrlWithToken = (rawUrl: string): string => {
  const token = getToken();
  return buildImageUrl(rawUrl, token || undefined);
};
