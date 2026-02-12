import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { sessionAnalysisSchema, SESSION_ANALYSIS_PROMPT } from './schemas';

// Configure AI providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Provider configuration
type AIProvider = 'openai' | 'anthropic';

const PROVIDER_MODELS = {
  openai: openai('gpt-4-turbo'),
  anthropic: anthropic('claude-3-5-sonnet-20241022')
};

export async function analyzeSession(
  transcript: string,
  provider: AIProvider = 'openai'
): Promise<ReturnType<typeof sessionAnalysisSchema.parse>> {
  const model = PROVIDER_MODELS[provider];

  if (!model) {
    throw new Error(`AI provider ${provider} not available`);
  }

  try {
    const { object } = await generateObject({
      model,
      prompt: `${SESSION_ANALYSIS_PROMPT}

SESSION TRANSCRIPT:
${transcript}`,
      schema: sessionAnalysisSchema,
      temperature: 0.1, // Low temperature for consistent analysis
      maxTokens: 2000
    });

    return sessionAnalysisSchema.parse(object);
  } catch (error) {
    console.error('AI Analysis Error:', error);

    // Fallback to second provider if first fails
    if (provider === 'openai' && process.env.ANTHROPIC_API_KEY) {
      return analyzeSession(transcript, 'anthropic');
    }

    if (provider === 'anthropic' && process.env.OPENAI_API_KEY) {
      return analyzeSession(transcript, 'openai');
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
