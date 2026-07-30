import 'server-only';
import { generateText, streamText, type LanguageModelUsage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { LIMITS } from '@/config/limits';

/**
 * AI 模型的统一封装。
 * 基础解读用 claude-haiku-4-5（快、便宜）；
 * 深度解读用 claude-sonnet-4-5（强、可流式）；
 * fallback：anthropic 失败时切到 openai gpt-4o-mini。
 */

export type ModelTier = 'basic' | 'deep';

interface BasicResult {
  text: string;
  usage: LanguageModelUsage;
  model: string;
}

interface DeepStream {
  textStream: AsyncIterable<string>;
  // 结束后提供 usage 信息
  finalUsage: Promise<LanguageModelUsage>;
  model: string;
}

function pickModel(tier: ModelTier) {
  if (tier === 'basic') {
    if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-haiku-4-5' };
    if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4o-mini' };
    throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
  }
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-sonnet-4-5' };
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4o' };
  throw new Error('No AI provider configured for deep tier.');
}

function makeLanguageModel(spec: { provider: string; model: string }) {
  if (spec.provider === 'anthropic') return anthropic(spec.model);
  if (spec.provider === 'openai') return openai(spec.model);
  throw new Error(`Unknown provider: ${spec.provider}`);
}

/**
 * 基础解读：非流式，返回完整文本。
 * 用于占卜页面 "抽完牌立刻显示完整结果"。
 */
export async function generateBasic(prompt: string, systemPrompt?: string): Promise<BasicResult> {
  const spec = pickModel('basic');
  const result = await generateText({
    model: makeLanguageModel(spec),
    system: systemPrompt,
    prompt,
    maxTokens: 800,
    temperature: 0.7,
    abortSignal: AbortSignal.timeout(LIMITS.AI_STREAM_TIMEOUT_MS),
  });
  return { text: result.text, usage: result.usage, model: `${spec.provider}/${spec.model}` };
}

/**
 * 深度解读：流式输出，配合前端 useChat 或 EventSource。
 */
export function streamDeep(prompt: string, systemPrompt?: string): DeepStream {
  const spec = pickModel('deep');
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
    finalUsage: result.usage,
    model: `${spec.provider}/${spec.model}`,
  };
}