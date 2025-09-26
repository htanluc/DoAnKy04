import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    const token = req.nextUrl.searchParams.get('token');

    if (!url) {
      return new NextResponse('Missing url', { status: 400 });
    }

    // Decode URL
    const decodedUrl = decodeURIComponent(url);
    
    // Nếu URL là relative path, thêm API_BASE_URL
    let finalUrl = decodedUrl;
    if (!decodedUrl.startsWith('http')) {
      finalUrl = `${config.API_BASE_URL}${decodedUrl.startsWith('/') ? '' : '/'}${decodedUrl}`;
    } else {
      // Nếu URL chứa 10.0.3.2 (mobile IP), thay thế bằng localhost
      if (decodedUrl.includes('10.0.3.2')) {
        finalUrl = decodedUrl.replace('10.0.3.2', 'localhost');
        console.log('🔄 Converting mobile IP to localhost:', decodedUrl, '->', finalUrl);
      }
    }

    console.log('🖼️ Image proxy fetching:', finalUrl);

    // Thêm timeout ngắn hơn để tránh chờ quá lâu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout

    try {
      const backendResponse = await fetch(finalUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'User-Agent': 'Apartment-Portal-Frontend/1.0',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        console.error('❌ Image fetch failed:', backendResponse.status, backendResponse.statusText);
        return new NextResponse('Failed to fetch image', { status: backendResponse.status });
      }

      const contentType = backendResponse.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await backendResponse.arrayBuffer();
      
      console.log('✅ Image fetched successfully:', finalUrl);
      
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Nếu là lỗi timeout hoặc kết nối, trả về placeholder image
      if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('timeout'))) {
        console.warn('⚠️ Image fetch timeout, returning placeholder:', finalUrl);
        return createPlaceholderImage();
      }
      
      throw fetchError;
    }
  } catch (err) {
    console.error('❌ Image proxy error:', err);
    
    // Trả về placeholder image thay vì lỗi 500
    return createPlaceholderImage();
  }
}

// Tạo placeholder image SVG
function createPlaceholderImage() {
  const svg = `
    <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="150" fill="#f3f4f6"/>
      <text x="100" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        Không thể tải hình ảnh
      </text>
      <text x="100" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
        Backend không khả dụng
      </text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}


