#!/usr/bin/env bash
# 只读拉取产品仓库 main 分支上的设计参考文件，供 agent 理解现有样式机制。
# 用法：bash tools/fetch-main-styles.sh [输出目录]   （默认 .main-reference/）
#
# 这是一个只读工具：它只 fetch 和 show，不会切换分支、不会改动本分支任何已跟踪文件。
# 输出目录在 .gitignore 里，不会被提交。
set -euo pipefail

out="${1:-.main-reference}"
branch="${MAIN_REF:-origin/main}"

# 显式写 refspec：单分支浅克隆（clone --branch design/workbench --depth=1）里
# 默认 fetch 不会创建 origin/main，只有 FETCH_HEAD，所以这里强制建立该引用。
fetch_ref() {
  git fetch --depth=1 origin "+refs/heads/main:refs/remotes/origin/main" >/dev/null 2>&1 \
    || git fetch origin "+refs/heads/main:refs/remotes/origin/main"
}

# 允许读取的路径白名单——只包含与视觉、DOM、字体有关的内容。
# 不要往这里加 collections/globals/access/worker/payload.config 等与设计无关的代码。
paths=(
  "src/app/(frontend)/official-base.css"                  # 基础排版与设计变量
  "src/app/(frontend)/official-home.css"                  # 首页样式 + --noumi-* 变量定义
  "src/app/(frontend)/prototype-parity.css"               # 最终生效覆盖值（配色以此为准）
  "src/app/(frontend)/prototype-pages.css"                # 原型页适配
  "src/app/(frontend)/about/about.module.css"
  "src/app/(frontend)/blog/[slug]/blog-post.module.css"
  "src/app/(frontend)/contact/contact.module.css"
  "src/app/(frontend)/faqs/faqs.module.css"
  "src/app/(frontend)/features/[slug]/feature-page.module.css"
  "src/app/(frontend)/features/features.module.css"
  "src/app/(frontend)/invite/invite.module.css"
  "src/app/(frontend)/links/links.module.css"
  "src/app/(frontend)/pricing/pricing.module.css"
  "src/app/(frontend)/use-cases/[slug]/use-case.module.css"
  "src/app/(frontend)/use-cases/use-cases.module.css"
  "src/components/site/SiteHeader.tsx"
  "src/components/site/SiteFooter.tsx"
  "src/components/site/official/OfficialPersistentChrome.tsx"
  "src/components/site/official/OfficialContentSections.tsx"
  "src/lib/site/prototype/pages.json"                     # 24 个既有页面的真实 HTML
  "src/lib/site/prototype/routes.json"
  "public/assets/fonts/fonts.css"                         # 可用字体与字重
  "docs/PROTOTYPE-PAGE-COVERAGE.md"                       # 路由与页面覆盖说明
)

fetch_ref
mkdir -p "$out"

for p in "${paths[@]}"; do
  dest="$out/$p"
  if git cat-file -e "$branch:$p" 2>/dev/null; then
    mkdir -p "$(dirname "$dest")"
    git show "$branch:$p" > "$dest"
    printf '  %8s  %s\n' "$(wc -c < "$dest")" "$p"
  else
    printf '  MISSING   %s\n' "$p" >&2
  fi
done

echo
echo "参考文件已写入 $out/ （只读，勿提交）。"
echo "这些是现状快照，不是可以拷进 design/ 的模板：理解机制后请按 skill 里的规范自己写。"
