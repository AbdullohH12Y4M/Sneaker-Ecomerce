import { NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET() {
  try {
    const res = await api.get('/products', { params: { limit: 100 } });
    return NextResponse.json(res.data);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Failed to fetch products' }, { status: 500 });
  }
}
