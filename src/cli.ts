#!/usr/bin/env node
import "dotenv/config";

import { render } from "ink";
import { createElement } from "react";

import { readOpenAIConfig } from "./agent/config.js";
import { App } from "./ui/index.js";

function main(): void {
	const args = process.argv.slice(2);
	if (args.includes("--help") || args.includes("-h")) {
		process.stdout.write(
			"nano-cli-agent\n\n在交互式终端运行 pnpm start。\n输入 exit、quit 或按 Ctrl+C 退出。\n网关配置见 .env.example。\n",
		);
		return;
	}

	try {
		if (!process.stdin.isTTY) {
			throw new Error("请在交互式终端中运行 nano-cli-agent。");
		}

		const config = readOpenAIConfig(process.env);
		render(createElement(App, { config }));
	} catch (error) {
		const message = error instanceof Error ? error.message : "启动失败。";
		process.stderr.write(`${message}\n`);
		process.exitCode = 1;
	}
}

main();
