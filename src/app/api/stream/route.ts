// src/app/api/stream/route.ts
import { NextResponse } from 'next/server';
import { appendCall } from '@/lib/data';
import type { CallData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: CallData[] = await request.json();
    console.log('Received basic call data:', body);
    
    // The endpoint now expects an array of calls
    if (!Array.isArray(body)) {
      return NextResponse.json({ message: 'Invalid data format: expected an array' }, { status: 400 });
    }

    for (const call of body) {
        // Basic validation for each call object, only checking for call_id to be more permissive.
        if (!call.call_id) {
            console.warn('Invalid call data object skipped (missing call_id):', call);
            continue; // Skip invalid objects
        }
        await appendCall(call);
    }

    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
