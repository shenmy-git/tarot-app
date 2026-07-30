import 'server-only';
import { generateText, streamText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { anthropic } from '@ai-sdk/anthropic';
import { LIMITS } from '@/config/limits';

/**
 * AI 模型的统一封装。
 * - 基础解读：sensenova-6.7-flash-lite（商汤日日新，快、便宜、国内）
 * - 深度解读：claude-sonnet-4-5（强、可流式）
 * - 优先级：sensenova → anthropic → openai
 */

export type ModelTier = 'basic' | 'deep';

interface BasicResult {
  text: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  model: string;
}

interface DeepStream {
  textStream: AsyncIterable<string>;
  finalUsage: Promise<{ promptTokens: number; completionTokens: number; totalTokens: number }>;
  model: string;
}

interface ModelSpec {
  provider: string;
  model: string;
}

function pickBasic(): ModelSpec {
  // 优先 sensenova（商汤，国内友好 + 便宜）
  if (process.env.SENSENOVA_API_KEY) {
    return { provider: 'sensenova', model: 'sensenova-6.7-flash-lite' };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', model: 'claude-haiku-4-5' };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', model: 'gpt-4o-mini' };
  }
  throw new Error(
    'No AI provider configured. Set SENSENOVA_API_KEY (recommended), ANTHROPIC_API_KEY, or OPENAI_API_KEY.',
  );
}

function pickDeep(): ModelSpec {
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', model: 'claude-sonnet-4-5' };
  }
  if (process.env.SENSENOVA_API_KEY) {
    return { provider: 'sensenova', model: 'sensenova-6.7-flash-lite' };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', model: 'gpt-4o' };
  }
  throw new Error('No AI provider configured for deep tier.');
}

function makeLanguageModel(spec: ModelSpec) {
  if (spec.provider === 'anthropic') {
    return anthropic(spec.model);
  }
  if (spec.provider === 'sensenova') {
    // 商汤日日新走 OpenAI 兼容协议
    const sensenova = createOpenAICompatible({
      name: 'sensenova',
      apiKey: process.env.SENSENOVA_API_KEY!,
      baseURL: process.env.SENSENOVA_BASE_URL ?? 'https://token.sensenova.cn/v1',
    });
    return sensenova(spec.model);
  }
  // OpenAI
  // 注意：避免在这里 import @ai-sdk/openai，因为 sensenova 已经覆盖了 OpenAI 兼容路径
  const { openai } = require('@ai-sdk/openai');
  return openai(spec.model);
}

/**
 * 基础解读：非流式，返回完整文本。
 */
export async function generateBasic(prompt: string, systemPrompt?: string): Promise<BasicResult> {
  const spec = pickBasic();
  const result = await generateText({
    model: makeLanguageModel(spec),
    system: systemPrompt,
    prompt,
    maxTokens: 800,
    temperature: 0.7,
    abortSignal: AbortSignal.timeout(LIMITS.AI_STREAM_TIMEOUT_MS),
  });
  return {
    text: result.text,
    usage: {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    },
    model: `${spec.provider}/${spec.model}`,
  };
}

/**
 * 深度解读：流式输出，配合前端 useChat 或 EventSource。
 */
export function streamDeep(prompt: string, systemPrompt?: string): DeepStream {
  const spec = pickDeep();
  const result = streamText({
    model: makeLanguageModel(spec),
    system: systemPrompt,
    prompt,
    maxTokens: 3000,
    temperature: 0.8,
    abortSignal: AbortSignal.timeout(LIMITS.AI_STREAM_TIMEOUT_MS),
  });
  return {
    textStream: (async function* () {
      for await (const chunk of result.textStream) {
        yield chunk;
      }
    })(),
    finalUsage: (async () => {
      const usage = await result.usage;
      return {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
      };
    })(),
    model: `${spec.provider}/${spec.model}`,
  };
}