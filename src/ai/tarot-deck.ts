/**
 * 塔罗牌组：22 张大阿卡那 + 56 张小阿卡那。
 * 这里仅给骨架（major arcana 完整数据），minor arcana 在 seed 阶段填充。
 * 完整生产数据应该来自 wikipedia / tarot API / 手工校对。
 */

export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: string; // e.g. "major:00"
  name: Record<'zh-CN' | 'zh-TW' | 'en', string>;
  upright: Record<'zh-CN' | 'zh-TW' | 'en', string>;
  reversed: Record<'zh-CN' | 'zh-TW' | 'en', string>;
  suit: Suit;
  number: number; // 0-21 for major, 1-14 for minor (1=Ace, 11=Page, 12=Knight, 13=Queen, 14=King)
  element?: 'fire' | 'water' | 'air' | 'earth';
}

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'major:00',
    name: { 'zh-CN': '愚者', 'zh-TW': '愚者', en: 'The Fool' },
    upright: {
      'zh-CN': '新的开始、纯真、自由、冒险精神',
      'zh-TW': '新的開始、純真、自由、冒險精神',
      en: 'New beginnings, innocence, freedom, adventure',
    },
    reversed: {
      'zh-CN': '鲁莽、犹豫、错失良机',
      'zh-TW': '魯莽、猶豫、錯失良機',
      en: 'Recklessness, hesitation, missed opportunity',
    },
    suit: 'major',
    number: 0,
  },
  {
    id: 'major:01',
    name: { 'zh-CN': '魔术师', 'zh-TW': '魔術師', en: 'The Magician' },
    upright: {
      'zh-CN': '创造力、意志力、技能',
      'zh-TW': '創造力、意志力、技能',
      en: 'Creativity, willpower, skill',
    },
    reversed: {
      'zh-CN': '操控、欺骗、才能未发挥',
      'zh-TW': '操控、欺騙、才能未發揮',
      en: 'Manipulation, deception, untapped talent',
    },
    suit: 'major',
    number: 1,
  },
  {
    id: 'major:02',
    name: { 'zh-CN': '女祭司', 'zh-TW': '女祭司', en: 'The High Priestess' },
    upright: {
      'zh-CN': '直觉、潜意识、神秘',
      'zh-TW': '直覺、潛意識、神秘',
      en: 'Intuition, subconscious, mystery',
    },
    reversed: {
      'zh-CN': '忽视直觉、表面化、秘密泄露',
      'zh-TW': '忽視直覺、表面化、秘密洩露',
      en: 'Ignored intuition, superficiality, secrets revealed',
    },
    suit: 'major',
    number: 2,
  },
  {
    id: 'major:03',
    name: { 'zh-CN': '皇后', 'zh-TW': '皇后', en: 'The Empress' },
    upright: {
      'zh-CN': '丰盛、母性、创造',
      'zh-TW': '豐盛、母性、創造',
      en: 'Abundance, motherhood, creativity',
    },
    reversed: {
      'zh-CN': '依赖、创造力受阻、过度保护',
      'zh-TW': '依賴、創造力受阻、過度保護',
      en: 'Dependence, blocked creativity, overprotection',
    },
    suit: 'major',
    number: 3,
  },
  {
    id: 'major:04',
    name: { 'zh-CN': '皇帝', 'zh-TW': '皇帝', en: 'The Emperor' },
    upright: {
      'zh-CN': '权威、结构、稳定',
      'zh-TW': '權威、結構、穩定',
      en: 'Authority, structure, stability',
    },
    reversed: {
      'zh-CN': '专制、僵化、失控',
      'zh-TW': '專制、僵化、失控',
      en: 'Tyranny, rigidity, loss of control',
    },
    suit: 'major',
    number: 4,
  },
  {
    id: 'major:05',
    name: { 'zh-CN': '教皇', 'zh-TW': '教皇', en: 'The Hierophant' },
    upright: {
      'zh-CN': '传统、教育、信念',
      'zh-TW': '傳統、教育、信念',
      en: 'Tradition, education, faith',
    },
    reversed: {
      'zh-CN': '反传统、教条、空虚',
      'zh-TW': '反傳統、教條、空虛',
      en: 'Rebellion, dogma, emptiness',
    },
    suit: 'major',
    number: 5,
  },
  {
    id: 'major:06',
    name: { 'zh-CN': '恋人', 'zh-TW': '戀人', en: 'The Lovers' },
    upright: {
      'zh-CN': '爱情、和谐、选择',
      'zh-TW': '愛情、和諧、選擇',
      en: 'Love, harmony, choice',
    },
    reversed: {
      'zh-CN': '失衡、错误选择、关系不和',
      'zh-TW': '失衡、錯誤選擇、關係不和',
      en: 'Imbalance, poor choice, disharmony',
    },
    suit: 'major',
    number: 6,
  },
  {
    id: 'major:07',
    name: { 'zh-CN': '战车', 'zh-TW': '戰車', en: 'The Chariot' },
    upright: {
      'zh-CN': '胜利、决心、行动力',
      'zh-TW': '勝利、決心、行動力',
      en: 'Victory, determination, action',
    },
    reversed: {
      'zh-CN': '失去方向、冲突、挫败',
      'zh-TW': '失去方向、衝突、挫敗',
      en: 'Lack of direction, conflict, defeat',
    },
    suit: 'major',
    number: 7,
  },
  {
    id: 'major:08',
    name: { 'zh-CN': '力量', 'zh-TW': '力量', en: 'Strength' },
    upright: {
      'zh-CN': '勇气、内在力量、耐心',
      'zh-TW': '勇氣、內在力量、耐心',
      en: 'Courage, inner strength, patience',
    },
    reversed: {
      'zh-CN': '软弱、自我怀疑、缺乏自制',
      'zh-TW': '軟弱、自我懷疑、缺乏自制',
      en: 'Weakness, self-doubt, lack of self-control',
    },
    suit: 'major',
    number: 8,
  },
  {
    id: 'major:09',
    name: { 'zh-CN': '隐者', 'zh-TW': '隱者', en: 'The Hermit' },
    upright: {
      'zh-CN': '内省、孤独、智慧',
      'zh-TW': '內省、孤獨、智慧',
      en: 'Introspection, solitude, wisdom',
    },
    reversed: {
      'zh-CN': '孤立、固执、拒绝建议',
      'zh-TW': '孤立、固執、拒絕建議',
      en: 'Isolation, stubbornness, rejecting guidance',
    },
    suit: 'major',
    number: 9,
  },
  {
    id: 'major:10',
    name: { 'zh-CN': '命运之轮', 'zh-TW': '命運之輪', en: 'Wheel of Fortune' },
    upright: {
      'zh-CN': '转折、循环、好运',
      'zh-TW': '轉折、循環、好運',
      en: 'Turning point, cycles, good luck',
    },
    reversed: {
      'zh-CN': '不顺、抵抗改变、坏运',
      'zh-TW': '不順、抵抗改變、壞運',
      en: 'Bad luck, resisting change, setbacks',
    },
    suit: 'major',
    number: 10,
  },
  {
    id: 'major:11',
    name: { 'zh-CN': '正义', 'zh-TW': '正義', en: 'Justice' },
    upright: {
      'zh-CN': '公平、真相、责任',
      'zh-TW': '公平、真相、責任',
      en: 'Fairness, truth, accountability',
    },
    reversed: {
      'zh-CN': '不公、逃避责任、偏见',
      'zh-TW': '不公、逃避責任、偏見',
      en: 'Unfairness, avoiding accountability, bias',
    },
    suit: 'major',
    number: 11,
  },
  {
    id: 'major:12',
    name: { 'zh-CN': '倒吊人', 'zh-TW': '倒吊人', en: 'The Hanged Man' },
    upright: {
      'zh-CN': '暂停、放下、新视角',
      'zh-TW': '暫停、放下、新視角',
      en: 'Pause, surrender, new perspective',
    },
    reversed: {
      'zh-CN': '拖延、抗拒、无谓牺牲',
      'zh-TW': '拖延、抗拒、無謂犧牲',
      en: 'Stalling, resistance, needless sacrifice',
    },
    suit: 'major',
    number: 12,
  },
  {
    id: 'major:13',
    name: { 'zh-CN': '死神', 'zh-TW': '死神', en: 'Death' },
    upright: {
      'zh-CN': '结束、转化、放下',
      'zh-TW': '結束、轉化、放下',
      en: 'Ending, transformation, letting go',
    },
    reversed: {
      'zh-CN': '抗拒改变、停滞、恐惧',
      'zh-TW': '抗拒改變、停滯、恐懼',
      en: 'Resisting change, stagnation, fear',
    },
    suit: 'major',
    number: 13,
  },
  {
    id: 'major:14',
    name: { 'zh-CN': '节制', 'zh-TW': '節制', en: 'Temperance' },
    upright: {
      'zh-CN': '平衡、耐心、中庸',
      'zh-TW': '平衡、耐心、中庸',
      en: 'Balance, patience, moderation',
    },
    reversed: {
      'zh-CN': '失衡、过度、不耐烦',
      'zh-TW': '失衡、過度、不耐煩',
      en: 'Imbalance, excess, impatience',
    },
    suit: 'major',
    number: 14,
  },
  {
    id: 'major:15',
    name: { 'zh-CN': '恶魔', 'zh-TW': '惡魔', en: 'The Devil' },
    upright: {
      'zh-CN': '束缚、欲望、执念',
      'zh-TW': '束縛、欲望、執念',
      en: 'Bondage, desire, obsession',
    },
    reversed: {
      'zh-CN': '挣脱、觉醒、放下执念',
      'zh-TW': '掙脫、覺醒、放下執念',
      en: 'Liberation, awakening, releasing attachment',
    },
    suit: 'major',
    number: 15,
  },
  {
    id: 'major:16',
    name: { 'zh-CN': '塔', 'zh-TW': '塔', en: 'The Tower' },
    upright: {
      'zh-CN': '突变、颠覆、觉醒',
      'zh-TW': '突變、顛覆、覺醒',
      en: 'Sudden change, upheaval, awakening',
    },
    reversed: {
      'zh-CN': '逃避灾难、抗拒改变、渐进瓦解',
      'zh-TW': '逃避災難、抗拒改變、漸進瓦解',
      en: 'Avoiding disaster, resisting change, gradual collapse',
    },
    suit: 'major',
    number: 16,
  },
  {
    id: 'major:17',
    name: { 'zh-CN': '星星', 'zh-TW': '星星', en: 'The Star' },
    upright: {
      'zh-CN': '希望、信心、灵感',
      'zh-TW': '希望、信心、靈感',
      en: 'Hope, faith, inspiration',
    },
    reversed: {
      'zh-CN': '失望、缺乏信念、疲惫',
      'zh-TW': '失望、缺乏信念、疲憊',
      en: 'Discouragement, doubt, exhaustion',
    },
    suit: 'major',
    number: 17,
  },
  {
    id: 'major:18',
    name: { 'zh-CN': '月亮', 'zh-TW': '月亮', en: 'The Moon' },
    upright: {
      'zh-CN': '幻象、直觉、潜意识',
      'zh-TW': '幻象、直覺、潛意識',
      en: 'Illusion, intuition, subconscious',
    },
    reversed: {
      'zh-CN': '走出迷雾、释放恐惧、真相浮现',
      'zh-TW': '走出迷霧、釋放恐懼、真相浮現',
      en: 'Releasing fear, truth emerging, clarity',
    },
    suit: 'major',
    number: 18,
  },
  {
    id: 'major:19',
    name: { 'zh-CN': '太阳', 'zh-TW': '太陽', en: 'The Sun' },
    upright: {
      'zh-CN': '快乐、成功、活力',
      'zh-TW': '快樂、成功、活力',
      en: 'Joy, success, vitality',
    },
    reversed: {
      'zh-CN': '短暂乌云、自我怀疑、延迟的成功',
      'zh-TW': '短暫烏雲、自我懷疑、延遲的成功',
      en: 'Temporary clouds, self-doubt, delayed success',
    },
    suit: 'major',
    number: 19,
  },
  {
    id: 'major:20',
    name: { 'zh-CN': '审判', 'zh-TW': '審判', en: 'Judgement' },
    upright: {
      'zh-CN': '反思、觉醒、召唤',
      'zh-TW': '反思、覺醒、召喚',
      en: 'Reflection, awakening, calling',
    },
    reversed: {
      'zh-CN': '自我批判、忽视召唤、停滞',
      'zh-TW': '自我批判、忽視召喚、停滯',
      en: 'Self-criticism, ignoring the call, stagnation',
    },
    suit: 'major',
    number: 20,
  },
  {
    id: 'major:21',
    name: { 'zh-CN': '世界', 'zh-TW': '世界', en: 'The World' },
    upright: {
      'zh-CN': '完成、成就、圆满',
      'zh-TW': '完成、成就、圓滿',
      en: 'Completion, achievement, wholeness',
    },
    reversed: {
      'zh-CN': '未完成、缺乏闭合、延迟',
      'zh-TW': '未完成、缺乏閉合、延遲',
      en: 'Incompletion, lack of closure, delays',
    },
    suit: 'major',
    number: 21,
  },
];

/**
 * 随机抽 N 张不重复的牌（含正逆位）。
 */
export function drawRandomCards(count: number, deck: TarotCard[] = MAJOR_ARCANA): Array<{
  card: TarotCard;
  upright: boolean;
}> {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    card,
    upright: Math.random() > 0.4, // 60% 正位，40% 逆位
  }));
}