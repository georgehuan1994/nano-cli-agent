import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { APICallError, type LanguageModelUsage, type ModelMessage, streamText, type StreamTextResult } from "ai";

import type { IOpenAIConfig, ITokenUsageInfo } from "../types.js";
import { SYSTEM_PROMPT } from "./system/prompt.js";
import { tools } from "./tools/index.js";

interface IRunOptions {
	/** 每当模型生成新的文本时的回调 */
	onToken: (text: string) => void;
	/** 中止信号，用于取消模型请求 */
	abortSignal?: AbortSignal;
}

export interface IRunResult {
	/** 模型生成的文本 */
	text: string;
	/** token 用量 */
	usage: ITokenUsageInfo;
}

/**
 * 运行 Agent 并返回模型生成的文本及 token 使用情况
 *
 * @param config OpenAI 配置
 * @param messages 模型的输入消息
 * @param onToken 每当模型生成新的文本时的回调
 * @param abortSignal 中止信号，用于取消模型请求
 *
 * @returns 模型生成的文本及 token 使用情况
 * @throws 当模型请求失败或被取消时抛出错误
 */
export async function runAgent(
	config: IOpenAIConfig,
	messages: ModelMessage[],
	{ onToken, abortSignal }: IRunOptions,
): Promise<IRunResult> {
	const openai: OpenAIProvider = createOpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });

	try {
		const result: StreamTextResult<typeof tools, never> = streamText({
			model: openai.chat(config.modelName),
			system: SYSTEM_PROMPT,
			messages,
			tools,
			...(abortSignal === undefined ? {} : { abortSignal }),
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
				case "text-start":
				case "text-end":
				case "reasoning-start":
				case "reasoning-end":
				case "reasoning-delta":
				case "tool-input-start":
				case "tool-input-end":
				case "tool-input-delta":
				case "source":
				case "file":
				case "tool-call":
				case "tool-result":
				case "tool-error":
				case "start-step":
				case "finish-step":
				case "start":
				case "finish":
				case "raw":
					break;
			}
		}

		const [text, usage]: [string, LanguageModelUsage] = await Promise.all([result.text, result.usage]);
		if (text.trim() !== "") {
			return { text, usage };
		}
	} catch (error) {
		if (abortSignal?.aborted === true) {
			throw new Error("模型请求已取消。", { cause: error });
		}

		const statusCode: number | undefined = APICallError.isInstance(error) ? error.statusCode : undefined;
		if (statusCode !== undefined && statusCode > 0) {
			throw new Error(`网关请求失败（HTTP ${String(statusCode)}）。`, { cause: error });
		}

		throw new Error("模型请求失败，请检查网关地址、连接和模型配置。", { cause: error });
	}

	throw new Error("网关返回了空回复。");
}
