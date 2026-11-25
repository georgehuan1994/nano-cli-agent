export interface IOpenAIConfig {
	baseURL: string;
	apiKey: string;
	model: string;
	contextWindow?: number | undefined;
}

export interface ITokenUsageInfo {
	inputTokens: number | undefined;
	outputTokens: number | undefined;
	totalTokens: number | undefined;
}
