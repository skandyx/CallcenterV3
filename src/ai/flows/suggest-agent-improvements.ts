// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing agent performance data and providing personalized suggestions for improvement using GenAI.
 *
 * - suggestAgentImprovements - A function that handles the agent improvement suggestion process.
 * - SuggestAgentImprovementsInput - The input type for the suggestAgentImprovements function.
 * - SuggestAgentImprovementsOutput - The return type for the suggestAgentImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAgentImprovementsInputSchema = z.object({
  agentId: z.string().describe('The unique identifier of the agent.'),
  kpis: z.record(z.string(), z.number()).describe('A record of key performance indicators (KPIs) for the agent, with the KPI name as the key and the value as the number.'),
  recentCallTranscripts: z.array(z.string()).describe('An array of recent call transcripts for the agent.'),
});
export type SuggestAgentImprovementsInput = z.infer<typeof SuggestAgentImprovementsInputSchema>;

const SuggestAgentImprovementsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.string().describe('The type of suggestion (e.g., training, strategy adjustment).'),
      description: z.string().describe('A detailed description of the suggestion.'),
      rationale: z.string().describe('The rationale behind the suggestion, based on the agent data.'),
    })
  ).describe('A list of personalized suggestions for agent improvement.'),
});
export type SuggestAgentImprovementsOutput = z.infer<typeof SuggestAgentImprovementsOutputSchema>;

export async function suggestAgentImprovements(input: SuggestAgentImprovementsInput): Promise<SuggestAgentImprovementsOutput> {
  return suggestAgentImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAgentImprovementsPrompt',
  input: {schema: SuggestAgentImprovementsInputSchema},
  output: {schema: SuggestAgentImprovementsOutputSchema},
  prompt: `You are an AI-powered performance analyst for a call center. Your task is to analyze agent performance data and provide personalized suggestions for improvement.

  Agent ID: {{{agentId}}}

  Key Performance Indicators (KPIs):
  {{#each (keys kpis)}}
  - {{this}}: {{lookup ../kpis this}}
  {{/each}}

  Recent Call Transcripts:
  {{#each recentCallTranscripts}}
  - {{{this}}}
  {{/each}}

  Based on the provided data, generate a list of suggestions for this agent. Each suggestion should include a type (e.g., training, strategy adjustment), a detailed description, and a rationale based on the agent's data.

  Ensure that the suggestions are specific, actionable, and tailored to the agent's individual needs.
  `, safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
});

const suggestAgentImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestAgentImprovementsFlow',
    inputSchema: SuggestAgentImprovementsInputSchema,
    outputSchema: SuggestAgentImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
