import { tool, type ToolSet } from "ai";
import { z } from "zod";

export const tools: ToolSet = {
	/** 获取当前日期和时间 */
	getCurrentDateTime: tool({
		description: "获取运行环境当前的日期、时间和时区。",
		inputSchema: z.object({}),
		execute: (): { localDateTime: string; timeZone: string; utcDateTime: string } => {
			const now: Date = new Date();
			const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat("zh-CN", {
				dateStyle: "full",
				timeStyle: "medium",
				hourCycle: "h23",
			});

			return {
				localDateTime: formatter.format(now),
				timeZone: formatter.resolvedOptions().timeZone,
				utcDateTime: now.toISOString(),
			};
		},
	}),
};
