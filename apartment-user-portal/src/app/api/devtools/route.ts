import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Apartment Portal",
    description: "Portal quản lý chung cư",
    version: "1.0.0",
    devtools: {
      enabled: false
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
