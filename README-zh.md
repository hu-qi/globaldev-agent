# GlobalDev Agent 中文说明

**从 README 到全球发布。**

[English README](./README.md)

GlobalDev Agent 是一个面向开源项目、开发者工具和独立产品的 AI DevRel / 出海增长 Agent。用户输入一个 GitHub 仓库地址，系统会自动读取 README、仓库元数据和近期 Issues，并生成一份完整的 **Global Launch Kit 出海增长包**，包括产品定位、海外开发者用户画像、Product Hunt / Hacker News / Reddit / X / LinkedIn 发布文案、Issue 反馈洞察和增长任务看板。

## 项目定位

很多优秀的中国开发者工具和开源项目，在出海时会遇到三个典型问题：

1. 不知道如何用英文讲清楚产品价值。
2. 不知道应该去哪些海外社区发布。
3. 不知道如何把海外用户反馈转化为产品迭代任务。

GlobalDev Agent 的目标是把一个 GitHub 仓库转化为一份可执行的海外增长方案，让小团队也能拥有类似 DevRel、Growth 和产品经理的协同能力。

## 核心工作流

```text
GitHub 仓库地址
        ↓
Repo Analyzer 读取 README、仓库元数据和近期 Issues
        ↓
Product Analyst Agent 分析产品价值、目标用户和差异化
        ↓
Market Positioning Agent 生成海外定位和用户画像
        ↓
Content Agent 生成多平台发布文案
        ↓
Feedback Agent 聚类 GitHub Issues 中的用户反馈
        ↓
Growth PM Agent 生成优先级增长任务
```

## 参赛要求：GMI Cloud Inference Engine

本项目在核心推理和内容生成环节中显式调用 **GMI Cloud Inference Engine**。

- 服务平台：GMI Cloud Inference Engine
- API 类型：OpenAI-compatible Chat Completions
- 默认接口地址：`https://api.gmi-serving.com/v1/chat/completions`
- API Key 环境变量：`GMI_API_KEY`
- 默认模型环境变量：`GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro`
- 安全策略：API Key 仅在服务端读取，不会暴露到浏览器端代码中

### API 调用场景

| 场景 | Agent 节点 | 输入 | 输出 |
|---|---|---|---|
| 产品分析 | Product Analyst Agent | GitHub README、repo metadata、topics、language、stars | 产品类型、核心价值、目标用户、差异化 |
| 海外定位 | Market Positioning Agent | 产品分析结果 | 英文 one-liner、定位叙事、海外用户画像 |
| 发布内容生成 | Content Agent | 产品定位和仓库上下文 | Product Hunt、Hacker News、Reddit、X、LinkedIn 文案 |
| 反馈洞察 | Feedback Agent | 近期 GitHub Issues | 反馈主题、用户顾虑、采用阻力 |
| 增长执行 | Growth PM Agent | 上述所有输出 | 优先级增长任务看板 |

### 参数设计

GMI Cloud 调用参数设计如下：

```json
{
  "model": "process.env.GMI_MODEL",
  "messages": [
    { "role": "system", "content": "GlobalDev Agent role and output rules" },
    { "role": "user", "content": "Repository snapshot and JSON schema request" }
  ],
  "temperature": 0.4,
  "max_tokens": 128000,
  "response_format": { "type": "json_object" },
  "context_length_exceeded_behavior": "truncate"
}
```

### 链路逻辑

```text
用户输入 GitHub 仓库 URL
        ↓
后端通过 GitHub REST API 获取 README、metadata、Issues
        ↓
/api/analyze 生成 compact repository snapshot
        ↓
服务端调用 GMI Cloud Inference Engine Chat Completions API
        ↓
模型返回结构化 Global Launch Kit JSON
        ↓
应用解析 JSON，并在必要时使用安全 fallback 字段
        ↓
前端展示 Agent Timeline、定位、发布内容、Issue 洞察和增长任务
```

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- GitHub REST API
- GMI Cloud Inference Engine
- GitHub Actions CI
- Vercel 部署

## 功能特性

- 支持输入 `owner/repo` 或完整 GitHub URL
- 通过 GitHub REST API 获取 README 与仓库元数据
- 配置 `GITHUB_TOKEN` 后可读取近期 GitHub Issues（私有仓库/更高频率/更稳定）
- 通过 GMI Cloud Inference Engine 生成结构化 Global Launch Kit
- 默认使用环境变量配置推理参数与模型
- 未配置 `GMI_API_KEY` 时提供高质量的 mock 输出，便于本地演示与预览 UI

## 本地运行

```bash
pnpm install
pnpm dev
```

打开：

```text
http://localhost:3000
```

然后输入一个 GitHub 仓库地址，例如：

```text
https://github.com/vercel/next.js
```

## 环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

`.env.local` 示例：

```env
# 可选：提升 GitHub API 限额，或读取私有仓库
GITHUB_TOKEN=

# 参赛必需：GMI Cloud Inference Engine
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_API_KEY=
GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro
GMI_TEMPERATURE=0.4
GMI_MAX_TOKENS=128000
```

注意：不要把真实 `GMI_API_KEY` 提交到 GitHub。建议在本地 `.env.local`、Vercel Environment Variables 和 GitHub Actions Secrets 中分别配置。

当未配置 `GMI_API_KEY` 时，应用会返回高质量的 mock Global Launch Kit 以便演示。在正式参赛演示与对外部署中，请配置 `GMI_API_KEY` 以确保所有推理与内容生成都通过 GMI Cloud Inference Engine 完成。

## 部署到 Vercel

可以部署到 Vercel。推荐步骤如下：

1. 打开 Vercel 控制台。
2. 选择 **Add New Project**。
3. 导入 GitHub 仓库：`hu-qi/globaldev-agent`。
4. Framework Preset 选择 **Next.js**。
5. Build Command 使用默认值：

```bash
pnpm build
```

6. Install Command 使用：

```bash
pnpm install --no-frozen-lockfile
```

7. 在 Vercel 项目的 Environment Variables 中添加：

```text
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_API_KEY=你的新 GMI Cloud API Key
GMI_MODEL=deepseek-ai/DeepSeek-V4-Pro
GMI_TEMPERATURE=0.4
GMI_MAX_TOKENS=128000
```

可选添加：

```text
GITHUB_TOKEN=你的 GitHub Token
```

8. 点击 Deploy。

部署完成后，打开 Vercel 分配的域名，输入 GitHub 仓库地址即可演示完整链路。

## GitHub Actions CI

仓库已配置 GitHub Actions：

- 主 Build Job：安装依赖、执行 TypeScript 检查、构建 Next.js 应用。
- GMI Cloud Smoke Test Job：调用 GMI Cloud Inference Engine 做最小链路验证。

需要在 GitHub 仓库中配置 Secret：

```text
GMI_API_KEY
```

配置路径：

```text
Repo → Settings → Secrets and variables → Actions → New repository secret
```

可选配置：

```text
GMI_BASE_URL
GMI_MODEL
```

GMI smoke test 会验证：

- API Key 是否可用
- endpoint 是否可访问
- model 是否可调用
- JSON response format 是否可用
- 返回内容是否可解析

当 `GMI_API_KEY` 未配置时，smoke test 会输出 skip 信息并以成功状态退出，避免 fork PR 因无法读取 Secrets 而失败。

## 演示脚本

1. 打开首页。
2. 输入一个 GitHub 仓库地址。
3. 点击 **Generate Global Launch Kit**。
4. 展示 Agent Timeline：Repo Analyzer → Product Analyst → Market Agent → Content Agent → Feedback Agent → Growth PM。
5. 展示生成结果：
   - 产品定位
   - 海外用户画像
   - 多平台发布文案
   - Issue 反馈洞察
   - 增长任务看板
6. 强调核心推理和生成链路由 GMI Cloud Inference Engine 提供。

## 路演一句话

> GlobalDev Agent 将 GitHub 仓库转化为全球发布方案，帮助中国开发者工具和开源项目完成海外定位、发布内容生成、反馈洞察和增长任务拆解；核心推理与内容生成均由 GMI Cloud Inference Engine 驱动。

## Roadmap

- [x] 将增长任务创建为 GitHub Issues（单条创建）。
- [x] 生成 Product Hunt 发布资产包。
- [x] 增加海外社区规则检查（Hacker News / Reddit）。
- [x] 结果页发布与 SEO：支持 `/result/<id>`（SSR + 元信息 + sitemap，作为 UGC 内容页）。
- [ ] 将任务看板批量创建为 GitHub Issues。
- [ ] 支持可配置 Issue labels 与模板（assignees 可选）。
- [ ] 接入真实反馈：先支持手动导入，再做 Product Hunt / Reddit / Hacker News / X 抓取。
