// src/app/api/stream/advanced-calls/route.ts
import { NextResponse } from 'next/server';
import { appendAdvancedCall } from '@/lib/data';
import type { AdvancedCallData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AdvancedCallData = await request.json();
    if (!body.callId || !body.timestamp || !body.event) {
        return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }
    await appendAdvancedCall(body);
    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream/advanced-calls:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
