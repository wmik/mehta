import { generateText, Output } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ollama-ai-provider-v2';
import { sessionAnalysisSchema, SESSION_ANALYSIS_PROMPT } from './schemas';

// Configure AI providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const ollama = createOllama({
  baseURL: process.env.OLLAMA_API_URL || '',
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`
  }
});

// Provider configuration
type AIProvider = 'openai' | 'anthropic' | 'ollama';

const PROVIDER_MODELS = {
  openai: openai(process.env.OPENAI_MODEL ?? 'gpt-4-turbo'),
  anthropic: anthropic(
    process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022'
  ),
  ollama: ollama(process.env.OLLAMA_MODEL ?? 'phi3')
};

export async function analyzeSession(
  transcript: string,
  provider: AIProvider = (process.env.AI_PROVIDER as AIProvider) ?? 'openai'
): Promise<ReturnType<typeof sessionAnalysisSchema.parse>> {
  const model = PROVIDER_MODELS[provider];

  if (!model) {
    throw new Error(`AI provider ${provider} not available`);
  }

  console.log(`Running analysis with ${provider}`);

  try {
    const result = await generateText({
      model,
      prompt: `${SESSION_ANALYSIS_PROMPT}

SESSION TRANSCRIPT:
${transcript}`,
      output: Output.object({ schema: sessionAnalysisSchema }),
      temperature: 0.1, // Low temperature for consistent analysis
      maxRetries: 2
    });

    return result.output;
  } catch (error) {
    console.error('AI Analysis Error:', error);

    // Fallback to second provider if first fails
    if (provider === 'openai' && process.env.ANTHROPIC_API_KEY) {
      return analyzeSession(transcript, 'anthropic');
    }

    if (provider === 'anthropic' && process.env.OPENAI_API_KEY) {
      return analyzeSession(transcript, 'openai');
    }

    if (provider === 'ollama' && process.env.OLLAMA_API_URL) {
      return analyzeSession(transcript, 'ollama');
    }

    throw new Error(
      `Failed to analyze session with provider ${provider}: ${error}`
    );
  }
}

// Helper function to get available providers
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push('openai');
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push('anthropic');
  }

  return providers;
}
