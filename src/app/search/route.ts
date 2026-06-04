import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Use nested routes under /app/info/[slug]/page.tsx' });
}
