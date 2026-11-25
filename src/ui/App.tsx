import type { ModelMessage } from "ai";
import { Box, useApp } from "ink";
import { type ReactElement, type RefObject, useEffect, useRef, useState } from "react";

import { type IRunResult, runAgent } from "../agent/run.js";
import type { IOpenAIConfig, ITokenUsageInfo } from "../types.js";
import { Input } from "./components/Input.js";
import { type IMessage, MessageList, MessageView } from "./components/MessageList.js";
import { Spinner } from "./components/Spinner.js";
import { TokenUsage } from "./components/TokenUsage.js";
import type { TState } from "./types.js";

export function App({ config }: { config: IOpenAIConfig }): ReactElement {
	const { exit }: ReturnType<typeof useApp> = useApp();
	const history: RefObject<ModelMessage[]> = useRef<ModelMessage[]>([]);
	const activeRequest: RefObject<AbortController | undefined> = useRef<AbortController>(undefined);
	const [messages, setMessages]: TState<IMessage[]> = useState<IMessage[]>([]);
	const [streamingText, setStreamingText]: TState<string | undefined> = useState<string>();
	const [usage, setUsage]: TState<ITokenUsageInfo | undefined> = useState<ITokenUsageInfo>();

	useEffect((): (() => void) => {
		return (): void => {
			activeRequest.current?.abort();
		};
	}, []);

	function appendMessage(role: IMessage["role"], content: string): void {
		setMessages((previous): IMessage[] => [...previous, { id: previous.length, role, content }]);
	}

	async function submit(prompt: string): Promise<void> {
		if (activeRequest.current) {
			return;
		}

		const command: string = prompt.trim().toLowerCase();
		if (command === "exit" || command === "quit") {
			exit();
			return;
		}

		const controller: AbortController = new AbortController();
		activeRequest.current = controller;
		const nextHistory: ModelMessage[] = [...history.current, { role: "user", content: prompt }];
		appendMessage("user", prompt);
		setStreamingText("");

		try {
			const result: IRunResult = await runAgent(config, nextHistory, {
				onToken: (token): void => {
					setStreamingText((text): string => (text ?? "") + token);
				},
				abortSignal: controller.signal,
			});
			if (controller.signal.aborted) {
				return;
			}

			history.current = [...nextHistory, { role: "assistant", content: result.text }];
			appendMessage("assistant", result.text);
			setUsage(result.usage);
		} catch (error) {
			if (!controller.signal.aborted) {
				appendMessage("error", error instanceof Error ? error.message : "请求失败，请重试。");
			}
		} finally {
			activeRequest.current = undefined;
			if (!controller.signal.aborted) {
				setStreamingText(undefined);
			}
		}
	}

	return (
		<Box flexDirection="column">
			<MessageList model={config.model} messages={messages} />
			{streamingText !== undefined && streamingText !== "" && (
				<MessageView message={{ role: "assistant", content: streamingText }} />
			)}
			{streamingText === "" && <Spinner />}
			<Input
				onSubmit={(prompt): void => {
					void submit(prompt);
				}}
				disabled={streamingText !== undefined}
			/>
			<TokenUsage usage={usage} contextWindow={config.contextWindow} />
		</Box>
	);
}
