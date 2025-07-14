// src/ai/flows/summarize-call-flow.ts
'use server';
/**
 * @fileOverview Summarizes complex call flows to identify bottlenecks and areas for improvement.
 *
 * - summarizeCall - A function that summarizes the call flow.
 * - SummarizeCallInput - The input type for the summarizeCall function.
 * - SummarizeCallOutput - The return type for the summarizeCall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCallInputSchema = z.object({
  callFlowDescription: z.string().describe('A detailed description of the call flow, including all transfers, IVR interactions, and agent interactions.'),
});
export type SummarizeCallInput = z.infer<typeof SummarizeCallInputSchema>;

const SummarizeCallOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the call flow, highlighting key steps and potential bottlenecks.'),
});
export type SummarizeCallOutput = z.infer<typeof SummarizeCallOutputSchema>;

export async function summarizeCall(input: SummarizeCallInput): Promise<SummarizeCallOutput> {
  return summarizeCallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCallPrompt',
  input: {schema: SummarizeCallInputSchema},
  output: {schema: SummarizeCallOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing call center call flows.

  Given the following detailed description of a call flow, provide a concise summary highlighting the key steps, any potential bottlenecks, and areas for improvement.

  Call Flow Description: {{{callFlowDescription}}}
  `,
});

const summarizeCallFlow = ai.defineFlow(
  {
    name: 'summarizeCallFlow',
    inputSchema: SummarizeCallInputSchema,
    outputSchema: SummarizeCallOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
