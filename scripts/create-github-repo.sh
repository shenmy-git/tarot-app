#!/usr/bin/env bash
# 自动创建 GitHub 仓库并推送代码
#
# 用法：
#   bash scripts/create-github-repo.sh <github-username> <repo-name> <personal-access-token>
#
# 步骤：
#   1. 在 https://github.com/settings/tokens/new 创建一个 PAT (classic)
#      - 勾选 "repo" 权限
#      - 勾选 "workflow" 权限（如需要 CI）
#      - 设置过期时间
#   2. 运行本脚本

set -e

USERNAME="$1"
REPO_NAME="$2"
TOKEN="$3"

if [ -z "$USERNAME" ] || [ -z "$REPO_NAME" ] || [ -z "$TOKEN" ]; then
  echo "❌ 用法: bash scripts/create-github-repo.sh <username> <repo-name> <token>"
  echo ""
  echo "获取 token: https://github.com/settings/tokens/new"
  echo "  - Note: 'tarot-app auto-create'"
  echo "  - Scopes: 勾选 'repo'"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "📦 创建 GitHub 仓库: $USERNAME/$REPO_NAME"

# 调用 GitHub API 创建仓库
HTTP_CODE=$(curl -s -o /tmp/github-create.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/user/repos" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"占卜解读 WebApp - Vercel + Supabase\",\"private\":false,\"auto_init\":false}")

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ 仓库创建成功"
elif [ "$HTTP_CODE" = "422" ]; then
  echo "⚠️  仓库已存在，跳过创建"
else
  echo "❌ 创建失败 (HTTP $HTTP_CODE)"
  cat /tmp/github-create.json
  exit 1
fi

# 关联 remote
REPO_URL="https://github.com/$USERNAME/$REPO_NAME.git"
echo "🔗 关联 remote: $REPO_URL"

# 删除已有的 origin（如果有）
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# 配置 token 到 remote URL（避免每次输入密码）
git remote set-url origin "https://$TOKEN@github.com/$USERNAME/$REPO_NAME.git"

# 推送
echo "🚀 推送代码到 main..."
git push -u origin main 2>&1 | tail -10

echo ""
echo "✅ 完成！仓库地址: https://github.com/$USERNAME/$REPO_NAME"
echo ""
echo "📝 下一步："
echo "   1. 访问 https://vercel.com/new 导入这个仓库"
echo "   2. 在 Vercel 配置环境变量（参考 .env.example）"
echo "   3. 推送新代码会自动触发部署"