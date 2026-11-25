export function parseContextWindow(value: string | undefined): number | undefined {
	const configured = value?.trim();
	if (!configured) {
		return undefined;
	}

	const size = Number(configured);
	if (!/^\d+$/.test(configured) || !Number.isSafeInteger(size) || size < 1) {
		throw new Error("OPENAI_CONTEXT_WINDOW 必须是正整数。");
	}
	return size;
}
