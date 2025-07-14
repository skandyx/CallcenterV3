// src/app/api/stream/route.ts
import { NextResponse } from 'next/server';
import { appendCall } from '@/lib/data';
import type { CallData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: CallData = await request.json();
    // Basic validation
    if (!body.callId || !body.timestamp || !body.status || !body.queue) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }
    await appendCall(body);
    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
