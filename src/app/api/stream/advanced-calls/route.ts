// src/app/api/stream/advanced-calls/route.ts
import { NextResponse } from 'next/server';
import { appendAdvancedCall } from '@/lib/data';
import type { AdvancedCallData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AdvancedCallData[] = await request.json();
    console.log('Received advanced call data:', body);

    if (!Array.isArray(body)) {
      return NextResponse.json({ message: 'Invalid data format: expected an array' }, { status: 400 });
    }

    for (const call of body) {
        if (!call.call_id || !call.enter_datetime) {
            console.warn('Invalid advanced call object skipped:', call);
            continue;
        }
        await appendAdvancedCall(call);
    }

    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream/advanced-calls:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
