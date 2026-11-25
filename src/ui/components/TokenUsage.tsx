import { Text } from "ink";
import type { ReactElement } from "react";

import type { ITokenUsageInfo } from "../../types.js";

const number: Intl.NumberFormat = new Intl.NumberFormat("zh-CN");

export function TokenUsage({
	usage,
	contextWindow,
}: {
	usage: ITokenUsageInfo | undefined;
	contextWindow: number | undefined;
}): ReactElement | undefined {
	if (!usage) {
		return undefined;
	}

	const { inputTokens, outputTokens, totalTokens }: ITokenUsageInfo = usage;
	const counts: string[] = [
		inputTokens === undefined ? "" : `输入 ${number.format(inputTokens)}`,
		outputTokens === undefined ? "" : `输出 ${number.format(outputTokens)}`,
		totalTokens === undefined ? "" : `合计 ${number.format(totalTokens)}`,
		contextWindow === undefined ? "" : `上下文窗口 ${number.format(contextWindow)}`,
	].filter(Boolean);
	if (counts.length === 0) {
		return undefined;
	}

	return <Text dimColor>Token · {counts.join(" · ")}</Text>;
}
