import { stripVTControlCharacters } from "node:util";

import { Box, Static, Text } from "ink";
import type { ReactElement } from "react";

export interface IMessage {
	id: number;
	role: "user" | "assistant" | "error";
	content: string;
}

const labels = {
	user: { title: "你", color: "cyan" },
	assistant: { title: "助手", color: "green" },
	error: { title: "请求失败", color: "red" },
} as const;

export function MessageView({ message: { role, content } }: { message: Omit<IMessage, "id"> }): ReactElement {
	const { color, title } = labels[role];
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Text bold color={color}>
				{title}
			</Text>
			<Text>{stripVTControlCharacters(content)}</Text>
		</Box>
	);
}

export function MessageList({ model, messages }: { model: string; messages: IMessage[] }): ReactElement {
	return (
		<Static items={[undefined, ...messages]}>
			{(message): ReactElement =>
				message ? (
					<MessageView key={message.id} message={message} />
				) : (
					<Box key="header" flexDirection="column" marginBottom={1}>
						<Text bold color="cyan">
							Nano CLI Agent · {stripVTControlCharacters(model)}
						</Text>
						<Text dimColor>Enter 发送 · exit、quit 或 Ctrl+C 退出</Text>
					</Box>
				)
			}
		</Static>
	);
}
