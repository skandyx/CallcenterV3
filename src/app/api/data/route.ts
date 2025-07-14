// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { readCalls, readAdvancedCalls, readAgentStatus, readProfileAvailability } from '@/lib/data';

export async function GET() {
  try {
    const [calls, advancedCalls, agentStatus, profileAvailability] = await Promise.all([
      readCalls(),
      readAdvancedCalls(),
      readAgentStatus(),
      readProfileAvailability()
    ]);

    return NextResponse.json({ 
        calls, 
        advancedCalls, 
        agentStatus, 
        profileAvailability 
    });
  } catch (error) {
    console.error('API Error /api/data:', error);
    return NextResponse.json({ message: 'Error fetching data.' }, { status: 500 });
  }
}
