import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url')
    const token = req.nextUrl.searchParams.get('token')

    if (!url) {
      return new NextResponse('Missing url', { status: 400 })
    }

    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    })

    if (!resp.ok) {
      return new NextResponse('Failed to fetch image', { status: resp.status })
    }

    const contentType = resp.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await resp.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return new NextResponse('Proxy error', { status: 500 })
  }
}


