// src/app/api/stream/profile-availability/route.ts
import { NextResponse } from 'next/server';
import { appendProfileAvailability } from '@/lib/data';
import type { ProfileAvailabilityData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: ProfileAvailabilityData[] = await request.json();
    console.log('Received profile availability data:', body);

    if (!Array.isArray(body)) {
      return NextResponse.json({ message: 'Invalid data format: expected an array' }, { status: 400 });
    }

    for (const profile of body) {
        if (!profile.user_id || !profile.date || !profile.user) {
            console.warn('Invalid profile availability object skipped:', profile);
            continue;
        }
        await appendProfileAvailability(profile);
    }

    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream/profile-availability:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
