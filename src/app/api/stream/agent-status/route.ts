// src/app/api/stream/agent-status/route.ts
import { NextResponse } from 'next/server';
import { appendAgentStatus } from '@/lib/data';
import type { AgentStatusData } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AgentStatusData = await request.json();
    if (!body.agentId || !body.timestamp || !body.status || !body.queue) {
        return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }
    await appendAgentStatus(body);
    return NextResponse.json({ message: 'Data received' }, { status: 200 });
  } catch (error) {
    console.error('API Error /api/stream/agent-status:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
