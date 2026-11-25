import type { IOpenAIConfig } from "../types.js";
import { parseContextWindow } from "./context/modelLimits.js";

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
	const value = env[name]?.trim() ?? "";
	if (value === "") {
		throw new Error(`请在 .env 中配置 ${name}。`);
	}

	return value;
}

export function readOpenAIConfig(env: NodeJS.ProcessEnv): IOpenAIConfig {
	const endpoint = URL.parse(requireEnv(env, "OPENAI_BASE_URL"));
	if (
		!endpoint ||
		!["http:", "https:"].includes(endpoint.protocol) ||
		endpoint.username !== "" ||
		endpoint.password !== "" ||
		endpoint.search !== "" ||
		endpoint.hash !== ""
	) {
		throw new Error("OPENAI_BASE_URL 必须是有效的 HTTP(S) 网关地址，且不能包含用户凭据、查询参数或片段。");
	}

	// VS Code stores the full endpoint. The SDK appends /chat/completions.
	const path = endpoint.pathname.replace(/\/+$/, "").replace(/\/chat\/completions$/, "");
	const apiKey = requireEnv(env, "OPENAI_API_KEY");
	if (/^\$\{input:[^}]+\}$/.test(apiKey)) {
		throw new Error("OPENAI_API_KEY 中请填写网关发放的实际密钥。");
	}

	const { OPENAI_CONTEXT_WINDOW: contextWindow } = env;
	return {
		baseURL: `${endpoint.origin}${path}`,
		apiKey,
		model: requireEnv(env, "OPENAI_MODEL"),
		contextWindow: parseContextWindow(contextWindow),
	};
}
