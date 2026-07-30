/**
 * 敏感词扫描脚本：扫描 i18n JSON + UI 组件源代码（跳过注释），禁止出现不合规词汇。
 *
 * 运行：`npm run scan:sensitive-words`
 *
 * 违反规则将导致脚本退出码 1，CI 中会失败。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// 敏感词清单
const BANNED_WORDS = {
  critical: ['算命', '算卦', '占卜', '占星', '转运', '开光', '灵签', '灵验', '改命', '预测命运'],
  warning: ['指点迷津', '趋吉避凶', '改运', '化解', '看相', '风水'],
};

const SCAN_DIRS = [
  path.join(ROOT, 'src/i18n/messages'),
  path.join(ROOT, 'src/components'),
  path.join(ROOT, 'src/app'),
];
const SCAN_EXTENSIONS = new Set(['.json', '.ts', '.tsx', '.js', '.jsx', '.mdx']);

/**
 * 移除代码中的单行和多行注释，避免误报。
 */
function stripComments(content: string, isJson: boolean): string {
  if (isJson) return content; // JSON 无注释
  // 移除 // 单行注释
  let s = content.replace(/\/\/[^\n]*/g, '');
  // 移除 /* */ 多行注释
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  return s;
}

let violations = 0;

function scanFile(file: string) {
  if (!SCAN_EXTENSIONS.has(path.extname(file))) return;
  const isJson = path.extname(file) === '.json';
  let content = fs.readFileSync(file, 'utf-8');
  content = stripComments(content, isJson);

  for (const [severity, words] of Object.entries(BANNED_WORDS)) {
    for (const word of words) {
      const regex = new RegExp(word, 'g');
      const matches = [...content.matchAll(regex)];
      if (matches.length > 0) {
        violations++;
        console.error(`❌ [${severity.toUpperCase()}] ${file}`);
        for (const m of matches) {
          const lineNum = content.slice(0, m.index!).split('\n').length;
          console.error(`   Line ${lineNum}: "${word}"`);
        }
      }
    }
  }
}

function walkDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walkDir(full);
    } else {
      scanFile(full);
    }
  }
}

console.log('🔍 扫描敏感词（跳过注释）...');
for (const dir of SCAN_DIRS) walkDir(dir);

if (violations === 0) {
  console.log('✅ 未发现敏感词');
  process.exit(0);
} else {
  console.error(`\n❌ 共发现 ${violations} 处敏感词违规`);
  console.error('请使用以下合规替代词：');
  console.error('  算命/占卜 → 解读/分析/参考');
  console.error('  算卦/占卦 → 抽签参考');
  console.error('  转运/改运 → 心态调整');
  console.error('  灵签/灵验 → 抽签参考/心象');
  process.exit(1);
}