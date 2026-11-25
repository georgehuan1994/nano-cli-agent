import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, type ModelMessage, streamText } from "ai";

import type { IOpenAIConfig, ITokenUsageInfo } from "../types.js";
import { SYSTEM_PROMPT } from "./system/prompt.js";
import { tools } from "./tools/index.js";

interface IRunOptions {
	onToken: (text: string) => void;
	abortSignal?: AbortSignal;
}

export async function runAgent(
	config: IOpenAIConfig,
	messages: ModelMessage[],
	{ onToken, abortSignal }: IRunOptions,
): Promise<{ text: string; usage: ITokenUsageInfo }> {
	const openai = createOpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });

	try {
		const result = streamText({
			model: openai.chat(config.model),
			system: SYSTEM_PROMPT,
			messages,
			tools,
			abortSignal,
			// The CLI displays a sanitized error after reading the stream.
			onError: (): void => {},
		});

		for await (const part of result.fullStream) {
			switch (part.type) {
				case "text-delta":
					onToken(part.text);
					break;
				case "error":
					throw part.error;
				case "abort":
					throw new Error("模型请求已取消。");
			}
		}

		const [text, usage] = await Promise.all([result.text, result.usage]);
		if (text.trim()) {
			return { text, usage };
		}
	} catch (error) {
		if (abortSignal?.aborted) {
			throw new Error("模型请求已取消。", { cause: error });
		}
		if (APICallError.isInstance(error) && error.statusCode) {
			throw new Error(`网关请求失败（HTTP ${String(error.statusCode)}）。`, { cause: error });
		}
		throw new Error("模型请求失败，请检查网关地址、连接和模型配置。", { cause: error });
	}

	throw new Error("网关返回了空回复。");
}
