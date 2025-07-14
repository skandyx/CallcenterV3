// src/app/api/stream/profile-availability/route.ts
import { NextResponse } from 'next/server';
import { appendProfileAvailability } from '@/lib/data';
import type { ProfileAvailabilityData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: ProfileAvailabilityData = await request.json();
    console.log('Received profile availability data:', body);
     if (!body.userId || !body.timestamp || !body.profile) {
        return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }
    await appendProfileAvailability(body);
    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream/profile-availability:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
