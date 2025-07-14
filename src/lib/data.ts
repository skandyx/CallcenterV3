// src/lib/data.ts
import fs from 'fs/promises';
import path from 'path';
import type { CallData, AdvancedCallData, AgentStatusData, ProfileAvailabilityData } from '@/types';

const dataDir = path.join(process.cwd(), 'Datas-json');

async function readFile<T>(filename: string): Promise<T[]> {
  const filePath = path.join(dataDir, filename);
  try {
    await fs.access(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    // If file does not exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function appendFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename);
  const currentData = await readFile<T>(filePath);
  currentData.push(data);
  await fs.writeFile(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
}

// Basic Calls
export const readCalls = () => readFile<CallData>('calls.json');
export const appendCall = (data: CallData) => appendFile('calls.json', data);

// Advanced Calls
export const readAdvancedCalls = () => readFile<AdvancedCallData>('advanced-calls.json');
export const appendAdvancedCall = (data: AdvancedCallData) => appendFile('advanced-calls.json', data);

// Agent Status
export const readAgentStatus = () => readFile<AgentStatusData>('agent-status.json');
export const appendAgentStatus = (data: AgentStatusData) => appendFile('agent-status.json', data);

// Profile Availability
export const readProfileAvailability = () => readFile<ProfileAvailabilityData>('profile-availability.json');
export const appendProfileAvailability = (data: ProfileAvailabilityData) => appendFile('profile-availability.json', data);
