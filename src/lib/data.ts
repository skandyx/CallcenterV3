// src/lib/data.ts
import fs from 'fs/promises';
import path from 'path';
import type { CallData, AdvancedCallData, AgentStatusData, ProfileAvailabilityData } from '@/types';

const dataDir = path.join(process.cwd(), 'Datas-json');
const dataFiles = [
  'calls.json',
  'advanced-calls.json',
  'agent-status.json',
  'profile-availability.json',
];

async function readFile<T>(filename: string): Promise<T[]> {
  const filePath = path.join(dataDir, filename);
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(filePath, 'utf-8');
    if (fileContent.trim() === '') {
        return [];
    }
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file does not exist, create it with an empty array and return the empty array.
      await fs.writeFile(filePath, '[]', 'utf-8');
      return [];
    }
    // If there's a JSON parsing error (e.g., file is corrupted or not valid JSON),
    // treat it as an empty array to prevent crashes.
     if (error instanceof SyntaxError) {
      console.warn(`Warning: Could not parse ${filename}. File might be corrupted. Treating as empty.`);
      return [];
    }
    // For other errors, re-throw them.
    throw error;
  }
}

async function appendFile<T>(filename:string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename);
  const currentData = await readFile<T>(filename);
  currentData.push(data);
  await fs.writeFile(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
}

export async function clearAllData(): Promise<void> {
    for (const filename of dataFiles) {
        const filePath = path.join(dataDir, filename);
        try {
            await fs.writeFile(filePath, '[]', 'utf-8');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                await fs.writeFile(filePath, '[]', 'utf-8');
            } else {
                throw error;
            }
        }
    }
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