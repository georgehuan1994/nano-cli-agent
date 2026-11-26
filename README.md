# Nano CLI Agent

用 TypeScript 实现的终端对话程序。输入消息后，CLI 会实时显示模型的回复，并在当前会话中保留对话历史。

## 安装和运行

开发环境需要 Node.js 22.13 及以上的 22.x 版本，或 Node.js 24 及以上。本项目使用 pnpm 11.25.0，依赖版本由 `pnpm-lock.yaml` 锁定。

```powershell
pnpm install
# 首次配置时执行，然后按下文填写 .env
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm start
```

已有 `.env` 时直接运行 `pnpm start`。输入消息后按 Enter 发送。输入 `exit`、`quit` 或按 Ctrl+C 退出。

```powershell
pnpm dev          # 修改源码后自动重启
pnpm lint         # 检查 src 中的 TypeScript 和 TSX
pnpm lint:fix     # 自动修复 ESLint 可修复的问题
pnpm check        # 运行 ESLint、Biome 和 TypeScript 检查
pnpm build        # 编译到 dist/
node dist/cli.js  # 从项目根目录启动编译后的 CLI
```

代码规范见 [ESLint 规则与代码检查](docs/eslint-rules.md)。

## 配置 OpenAI 兼容网关

在项目根目录的 `.env` 中配置网关。已经设置的进程环境变量优先于 `.env`。

| 环境变量 | 用途 |
| --- | --- |
| `OPENAI_BASE_URL` | 网关地址，保留 `/v1` 等路径前缀。也可以直接填完整的 `/chat/completions` URL。 |
| `OPENAI_API_KEY` | 网关发放的 API Key，程序会通过 `Authorization: Bearer …` 发送。 |
| `OPENAI_MODEL` | 网关支持的模型 ID。 |
| `OPENAI_CONTEXT_WINDOW` | 可选，模型的上下文窗口大小，单位为 token。网关返回用量时，CLI 会一起显示。 |

请在 `OPENAI_API_KEY` 中填入网关发放的实际密钥，选择 `chat-completions` 的模型。

`.env` 已被 Git 忽略，`.env.example` 只存放示例值。

程序会统一处理网关地址并用 `/chat/completions` 发送流式请求。例如，`https://gateway.example.com/v1` 和 `https://gateway.example.com/v1/chat/completions` 对应同一个接口。 [AI SDK 5 OpenAI Provider](https://ai-sdk.dev/v5/providers/ai-sdk-providers/openai)

## 目录结构

```text
.
├── docs/                        # 学习笔记与开发规范
├── src/
│   ├── index.ts                 # 源码入口
│   ├── cli.ts                   # 读取环境变量并启动终端 UI
│   ├── types.ts                 # 网关配置与 token 用量类型
│   ├── agent/
│   │   ├── config.ts            # 读取和校验网关配置
│   │   ├── run.ts               # 向模型发送消息并读取流式响应
│   │   ├── context/             # 上下文窗口配置
│   │   ├── system/              # 系统提示词
│   │   └── tools/               # 工具注册表
│   └── ui/
│       ├── App.tsx              # 管理对话历史与界面状态
│       ├── index.tsx            # UI 模块入口
│       └── components/          # 输入、消息、等待状态和用量
├── .env.example
├── biome.json
├── eslint.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── tsconfig.build.json
```

## 依赖包

| 运行依赖 | 用途 |
| --- | --- |
| `ai` | Vercel AI SDK 5，负责流式生成、对话消息类型和用量数据。 |
| `@ai-sdk/openai` | OpenAI Provider，连接自定义网关的 Chat Completions 接口。 |
| `zod` | AI SDK 要求的 schema 校验对等依赖。 |
| `dotenv` | 从当前目录的 `.env` 加载配置。 |
| `ink`、`react` | 用 React 组件渲染和管理终端交互。 |
| `ink-spinner` | 显示等待模型回复的动画。 |

| 开发依赖 | 用途 |
| --- | --- |
| `typescript` | 类型检查和编译。 |
| `tsx` | 直接运行 TypeScript 和监听源码变更，通过 `esbuild` 转译源码。 |
| `@types/node`、`@types/react` | Node.js 和 React 的类型声明。 |
| `@biomejs/biome` | 检查格式和代码规范，主要是自动处理换行。 |
| `eslint`、`@eslint/js` | ESLint 检查、自动修复及基础规则。 |
| `typescript-eslint` | TypeScript 解析器和严格的类型感知规则。 |
| `@stylistic/eslint-plugin` | 分号、引号、换行和尾逗号等风格规则。 |
| `eslint-plugin-simple-import-sort` | 自动排序导入和导出。 |
