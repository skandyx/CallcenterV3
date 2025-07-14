// src/app/api/stream/agent-status/route.ts
import { NextResponse } from 'next/server';
import { appendAgentStatus } from '@/lib/data';
import type { AgentStatusData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AgentStatusData[] = await request.json();
    console.log('Received agent status data:', body);
    
    if (!Array.isArray(body)) {
      return NextResponse.json({ message: 'Invalid data format: expected an array' }, { status: 400 });
    }

    for (const status of body) {
        if (!status.user_id || !status.date || !status.user) {
            console.warn('Invalid agent status object skipped:', status);
            continue;
        }
        await appendAgentStatus(status);
    }
    
    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error)
 {
    console.error('API Error /api/stream/agent-status:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
