import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    const token = req.nextUrl.searchParams.get('token');

    if (!url) {
      return new NextResponse('Missing url', { status: 400 });
    }

    const backendResponse = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      return new NextResponse('Failed to fetch image', { status: backendResponse.status });
    }

    const contentType = backendResponse.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await backendResponse.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new NextResponse('Proxy error', { status: 500 });
  }
}


