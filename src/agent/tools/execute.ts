import { pathToFileURL } from "node:url";

import { asSchema, type ToolSet } from "ai";

import { tools } from "./index.js";

export async function executeTool(name: string, input: unknown = {}): Promise<unknown> {
	const registeredTool: ToolSet[string] | undefined = Object.hasOwn(tools, name) ? tools[name] : undefined;
	if (registeredTool === undefined) {
		throw new Error(`未知工具：${name}`);
	}

	if (registeredTool.execute === undefined) {
		throw new Error(`工具不支持本地执行：${name}`);
	}

	const validated: Awaited<ReturnType<NonNullable<ReturnType<typeof asSchema>["validate"]>>> | undefined =
		await asSchema(registeredTool.inputSchema).validate?.(input);
	if (validated?.success === false) {
		throw new Error(`工具参数无效：${name}`, { cause: validated.error });
	}

	return await registeredTool.execute(validated?.success === true ? validated.value : input, {
		toolCallId: `manual-${name}`,
		messages: [],
	});
}

async function main(): Promise<void> {
	const [, , name, args]: string[] = process.argv;
	if (name === undefined) {
		throw new Error("用法：pnpm exec tsx src/agent/tools/execute.ts <工具名> [JSON 参数]");
	}

	const input: unknown = args === undefined ? {} : JSON.parse(args);
	const output: unknown = await executeTool(name, input);
	process.stdout.write(`${JSON.stringify(output, undefined, 2)}\n`);
}

const entryPoint: string | undefined = process.argv[1];
if (entryPoint !== undefined && import.meta.url === pathToFileURL(entryPoint).href) {
	void main().catch((error: unknown): void => {
		const message: string = error instanceof Error ? error.message : String(error);
		process.stderr.write(`${message}\n`);
		process.exitCode = 1;
	});
}
