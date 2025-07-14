export interface CallData {
  call_id: string;
  enter_datetime: string;
  status: 'Abandoned' | 'Answered' | 'Completed' | 'Missed';
  time_in_queue_seconds: number;
  queue_name: string;
  calling_number: string;
  agent_id?: string;
  talk_time_seconds?: number;
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
    user_id: string;
    user: string;
    date: string;
    hour: number;
    loggedIn: number;
    loggedOut: number;
    idle: number;
    queuename: string;
  }
  
  export interface ProfileAvailabilityData {
    user_id: string;
    user: string;
    date: string;
    hour: number;
    Available: number;
    Lunch: number;
    Meeting: number;
    [key: string]: any; // for other dynamic keys like P1, P2...
  }
  