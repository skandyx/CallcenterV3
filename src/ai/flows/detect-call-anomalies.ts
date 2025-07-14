// src/ai/flows/detect-call-anomalies.ts
'use server';
/**
 * @fileOverview An anomaly detection AI agent for call center data.
 *
 * - detectCallAnomalies - A function that handles the call anomaly detection process.
 * - DetectCallAnomaliesInput - The input type for the detectCallAnomalies function.
 * - DetectCallAnomaliesOutput - The return type for the detectCallAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCallAnomaliesInputSchema = z.object({
  callData: z.string().describe('A JSON string containing call data records.'),
});
export type DetectCallAnomaliesInput = z.infer<typeof DetectCallAnomaliesInputSchema>;

const DetectCallAnomaliesOutputSchema = z.object({
  hasAnomalies: z.boolean().describe('Whether anomalies were detected in the call data.'),
  anomaliesDescription: z
    .string()
    .describe('A detailed description of the detected anomalies.'),
});
export type DetectCallAnomaliesOutput = z.infer<typeof DetectCallAnomaliesOutputSchema>;

export async function detectCallAnomalies(input: DetectCallAnomaliesInput): Promise<DetectCallAnomaliesOutput> {
  return detectCallAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCallAnomaliesPrompt',
  input: {schema: DetectCallAnomaliesInputSchema},
  output: {schema: DetectCallAnomaliesOutputSchema},
  prompt: `You are an expert anomaly detection system for call center data.

You will receive call data as a JSON string. Analyze this data for any unusual patterns, spikes, or dips in call volume, unusual call durations, or any other suspicious activity.

Based on your analysis, determine if there are any anomalies present in the data. If anomalies are detected, provide a detailed description of the anomalies. Set the hasAnomalies field to true if anomalies are present, otherwise set it to false.

Call Data: {{{callData}}}
`,
});

const detectCallAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectCallAnomaliesFlow',
    inputSchema: DetectCallAnomaliesInputSchema,
    outputSchema: DetectCallAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
