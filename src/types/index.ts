export interface CallData {
  call_id: string;
  enter_datetime: string;
  status: 'Abandoned' | 'Answered' | 'Completed' | 'Missed' | 'Redirected' | 'Direct call' | string; // Loosened for other statuses
  time_in_queue_seconds: number;
  queue_name: string;
  calling_number: string;
  agent_id?: string;
  agent?: string;
  talk_time_seconds?: number;
  processing_time_seconds?: number;
  status_detail?: string;
  // Adding other potential fields from logs
  [key: string]: any;
}

export interface AdvancedCallData {
  call_id: string;
  enter_datetime: string;
  status: string;
  status_detail: string;
  agent?: string;
  agent_id?: string;
  agent_number?: string;
  calling_number: string;
  processing_time_seconds?: number;
  parent_call_id?: string;
  [key: string]: any;
}
  
  export interface AgentStatusData {
    user_id: string;
    user: string;
    email: string;
    date: string;
    hour: number;
    loggedIn: number;
    loggedOut: number;
    idle: number;
    queuename: string;
    queue_id: string;
  }
  
  export interface ProfileAvailabilityData {
    user_id: string;
    user: string;
    date: string;
    hour: number;
    Available: number;
    Lunch: number;
    Meeting: number;
    email: string;
    [key: string]: any; // for other dynamic keys like P1, P2...
  }
  
  export interface BillingData {
    call_id: string;
    agent: string;
    agent_id: string;
    agent_number: string;
    enter_datetime: string;
    calling_number: string;
    processing_time_seconds: number;
    profile: string;
  }
    



