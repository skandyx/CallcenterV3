export interface CallData {
    callId: string;
    timestamp: string;
    status: 'completed' | 'abandoned' | 'missed';
    duration: number; // in seconds
    queue: string;
  }
  
  export interface AdvancedCallData {
    callId: string;
    timestamp: string;
    event: 'transfer' | 'hold' | 'ivr' | 'queue_entry' | 'agent_pickup';
    from?: string; // agent or queue
    to?: string; // agent or queue
    duration?: number;
  }
  
  export interface AgentStatusData {
    agentId: string;
    agentName: string;
    timestamp: string;
    status: 'online' | 'offline' | 'on_call' | 'wrap_up' | 'paused';
    pauseReason?: string;
    queue: string;
  }
  
  export interface ProfileAvailabilityData {
    userId: string;
    userName: string;
    timestamp: string;
    profile: 'Available' | 'Lunch' | 'Meeting' | 'Away';
    duration: number; // seconds in this profile
  }
  