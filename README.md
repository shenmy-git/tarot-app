# 占卜解读 WebApp

基于 Next.js 15 + Vercel + Supabase 构建的多模块占卜类 WebApp。

## 功能模块

- 🃏 **塔罗解读**（Tarot）
- ⭐ **星座解读**（Astrology）
- 🔮 **八字解读**（Bazi）
- ☯️ **周易抽签**（I Ching / Yi Jing）
- 💭 **梦境解析**（Dream）
- 🌌 **出生星图**（Birth Chart / Western Astrology）

## 技术栈

- **前端**：Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS v4
- **UI**：shadcn/ui + lucide-react
- **后端**：Supabase（Postgres + RLS）
- **数据库**：Postgres + Drizzle ORM
- **AI**：Vercel AI SDK + Vercel AI Gateway（Claude Haiku 4.5 / Sonnet 4.5）
- **任务调度**：Inngest（durable execution）
- **支付**：
  - 国内：虎皮椒支付（个人微信/支付宝）
  - 海外：Creem.io（Stripe-like，个人可接入）
- **国际化**：next-intl（zh-CN / zh-TW / en）
- **部署**：Vercel（Git 集成 + Preview + Production）

## 本地启动

### 前置要求

- Node.js >= 18.18（推荐 20+）
- npm（已随 Node 安装）或 pnpm
- Git
- Supabase 账号（[supabase.com](https://supabase.com)）
- Vercel 账号（[vercel.com](https://vercel.com)）
- AI Gateway API Key（[vercel.com/dashboard](https://vercel.com/dashboard) → AI Gateway）
- 虎皮椒 / YunGouOS 账号（[hupijiao.com](https://www.hupijiao.com) / [yungouos.com](https://www.yungouos.com)）
- Creem 账号（[creem.io](https://creem.io)）

### 步骤

```bash
# 1. 克隆仓库
git clone <your-repo-url>
cd agent

# 2. 复制环境变量模板
cp .env.example .env.local
# 编辑 .env.local 填入实际值

# 3. 安装依赖（推荐用 pnpm，或 npm 也可）
npm install

# 4. 启动开发服务器
npm run dev
# → http://localhost:3000

# 5. 启动 Inngest dev server（新终端）
npx inngest-cli@latest dev
# → http://localhost:8288

# 6. 初始化数据库
npm run db:push    # 把 schema 推到 Supabase
npm run db:seed    # 插入种子数据（78 张塔罗牌等）
```

### 常用脚本

```bash
npm run dev           # 启动 Next.js dev server
npm run dev:inngest   # 启动 Inngest dev server
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run db:generate   # drizzle-kit generate（生成迁移）
npm run db:push       # drizzle-kit push（本地推送）
npm run db:studio     # drizzle-kit studio（数据库 GUI）
npm run seed          # 种子数据
```

## 部署

### Vercel 部署

1. 在 [vercel.com](https://vercel.com) Import 这个 Git 仓库
2. 配置环境变量（参考 `.env.example`，**所有 SECRET 标 Sensitive**）
3. 推送 `main` → 自动部署到生产
4. PR → 自动生成 Preview URL

### 国内 ICP 备案

- 域名需要在工信部备案（约 7-20 天）
- 备案后才能用国内 CDN 和支付回调
- 临时方案：先用 `*.vercel.app` 海外域名

### 支付配置

#### 虎皮椒（国内）

1. 注册 [hupijiao.com](https://www.hupijiao.com) 商家号
2. 实名认证（个人身份证）
3. 申请微信支付 + 支付宝通道
4. 配置回调 URL：`https://<your-domain>/api/payments/hupijiao/webhook`
5. 把 `app_id` / `app_secret` 填入 Vercel 环境变量

#### Creem（海外）

1. 注册 [creem.io](https://creem.io)
2. 在 Dashboard 创建产品（6 个模块 × 2 档 = 12 个 SKU）
3. 配置 Webhook：`https://<your-domain>/api/payments/creem/webhook`
4. 把 `api_key` / `webhook_secret` / `product_ids` 填入 Vercel 环境变量

## 目录结构

```
src/
├── app/              # Next.js App Router（含 i18n 路由）
├── components/       # React 组件
├── db/               # Drizzle schema + queries
├── supabase/         # Supabase clients
├── ai/               # Vercel AI Gateway 封装 + prompts
├── payments/         # PaymentProvider 抽象 + 三个 provider
├── jobs/             # Inngest functions
├── i18n/             # next-intl 配置 + 多语言文案
├── auth/             # admin 守卫（MVP 暂不接 Auth）
├── config/           # 静态配置
└── lib/              # 工具函数 + env 校验
```

## 敏感词与合规

所有 UI 文案**禁止**出现：算命 / 算卦 / 占卜 / 占星 / 转运 / 开光 / 灵签 / 灵验 / 指点迷津 / 预测命运 / 改命。

统一使用：**塔罗解读 / 星座解读 / 八字解读 / 抽签参考 / 性格倾向分析**。

每个占卜结果页顶部固定显示免责声明：
- zh-CN：`⚠️ 本服务仅供娱乐参考，不构成任何决策建议`
- zh-TW：`⚠️ 本服務僅供娛樂參考，不構成任何決策建議`
- en：`⚠️ For entertainment purposes only. Not professional advice.`

## 后续扩展

- 接入 Supabase Auth（用户账号 + 历史记录）
- 接入 Stripe（替代 Creem 作为海外支付）
- 移动端 PWA
- 微信小程序（国内版）
- 多语言扩展（日语 / 韩语）

## License

MIT