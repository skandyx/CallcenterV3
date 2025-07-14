import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-call-flow.ts';
import '@/ai/flows/detect-call-anomalies.ts';
import '@/ai/flows/suggest-agent-improvements.ts';