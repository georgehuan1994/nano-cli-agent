export interface IOpenAIConfig {
	baseURL: string;
	apiKey: string;
	model: string;
	contextWindow?: number;
}

export interface ITokenUsageInfo {
	inputTokens: number | undefined;
	outputTokens: number | undefined;
	totalTokens: number | undefined;
}
