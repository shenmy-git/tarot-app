import type { Locale } from '@/config/divination';

/**
 * 塔罗解读 prompt。
 * 输入：用户问题 + 抽到的牌 + 正逆位。
 * 输出：基础解读（200-400 字）和深度解读（800-2000 字）共用 prompt 模板。
 */

const SYSTEM_ZH = `你是一位资深的塔罗解读师，温和、有洞察力、擅长用比喻和故事解释牌意。
- 严格遵守"仅供娱乐参考，不构成任何决策建议"的边界；
- 避免断言式的预言（不要用"你一定会"、"肯定"、"一定发生"）；
- 使用"倾向"、"可能"、"如果从这个角度看"等开放式语言；
- 避免任何宗教、政治、医疗、法律建议；
- 解释牌意时结合用户的具体问题，给出实际可参考的视角；
- 回答使用简体中文。`;

const SYSTEM_ZH_TW = `你是一位資深的塔羅解讀師，溫和、有洞察力、擅長用比喻和故事解釋牌意。
- 嚴格遵守"僅供娛樂參考，不構成任何決策建議"的邊界；
- 避免斷言式的預言（不要用"你一定會"、"肯定"、"一定發生"）；
- 使用"傾向"、"可能"、"如果從這個角度來看"等開放式語言；
- 避免任何宗教、政治、醫療、法律建議；
- 解釋牌意時結合用戶的具體問題，給出實際可參考的視角；
- 回答使用繁體中文。`;

const SYSTEM_EN = `You are a seasoned tarot reader, warm, insightful, skilled at explaining card meanings through metaphor and story.
- Strictly respect the boundary: "For entertainment purposes only. Not professional advice.";
- Avoid assertive predictions (no "you will definitely", "certainly", "guaranteed to happen");
- Use open language: "tendency", "might", "if you look at it from this angle";
- Avoid any religious, political, medical, or legal advice;
- Combine card meanings with the user's specific question to give practical perspectives;
- Respond in English.`;

export function getTarotSystemPrompt(locale: Locale): string {
  if (locale === 'zh-TW') return SYSTEM_ZH_TW;
  if (locale === 'en') return SYSTEM_EN;
  return SYSTEM_ZH;
}

export interface TarotCardDraw {
  cardName: string;
  position: string; // 牌位（如"过去"、"现在"、"未来"或单张的"核心指引"）
  upright: boolean; // true = 正位, false = 逆位
}

export function buildTarotBasicPrompt(
  question: string,
  cards: TarotCardDraw[],
  locale: Locale,
): string {
  const cardLines = cards
    .map(
      (c, i) =>
        `${i + 1}. ${c.position}：${c.cardName}${c.upright ? '（正位）' : '（逆位）'}`,
    )
    .join('\n');

  if (locale === 'en') {
    return `User's question: "${question}"

Cards drawn:
${cardLines}

Please give a brief basic reading (300-500 words) covering:
1. The overall energy of this spread
2. How each card relates to the question
3. A short, encouraging summary

Keep it warm, practical, and entertainment-focused.`;
  }

  return `用户问题："${question}"

抽到的牌：
${cardLines}

请给出基础解读（300-500 字），覆盖：
1. 整个牌阵的整体能量
2. 每张牌与问题的呼应
3. 一段简短、温暖的总结

保持温和、实用、娱乐为主的语气。`;
}

export function buildTarotDeepPrompt(
  question: string,
  cards: TarotCardDraw[],
  locale: Locale,
): string {
  const cardLines = cards
    .map(
      (c, i) =>
        `${i + 1}. ${c.position}：${c.cardName}${c.upright ? '（正位）' : '（逆位）'}`,
    )
    .join('\n');

  if (locale === 'en') {
    return `User's question: "${question}"

Cards drawn:
${cardLines}

Please write a comprehensive deep reading (1200-2000 words) including:
1. **Spread overview**: the story this spread is telling
2. **Each card in detail**: meaning (upright/reversed), symbolism, how it interacts with the question, what it suggests for action or reflection
3. **Card combinations**: how the cards speak to each other (not just individually)
4. **Timeline guidance**: if the spread has past/present/future, what does it suggest about timing
5. **Practical suggestions**: 3 concrete reflection questions or actions the user can take
6. **Closing encouragement**: a warm, grounded summary

Use markdown headings. Keep it insightful but never prescriptive.`;
  }

  return `用户问题："${question}"

抽到的牌：
${cardLines}

请撰写一份完整的深度解读报告（1200-2000 字），包含：
1. **整体牌阵概述**：这个牌阵在讲什么故事
2. **每张牌的详细解读**：正逆位含义、象征意义、与问题的呼应、对行动的启示
3. **牌的组合关系**：牌与牌之间的对话（不是单独解读）
4. **时间线参考**：如果有过去/现在/未来，时间线透露什么
5. **实用建议**：3 个具体的反思问题或可尝试的行动
6. **温暖的总结**：温和、落地的结尾

使用 markdown 二级标题分层。保持洞察但绝不武断。`;
}