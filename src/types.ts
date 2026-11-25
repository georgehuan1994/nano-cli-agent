export interface IOpenAIConfig {
	/** OpenAI API 网关地址 */
	baseURL: string;
	/** OpenAI API 密钥 */
	apiKey: string;
	/** 模型名称 */
	modelName: string;
	/** 上下文窗口大小 */
	contextWindow?: number | undefined;
}

export interface ITokenUsageInfo {
	/** 输入的 token 数量 */
	inputTokens: number | undefined;
	/** 输出的 token 数量 */
	outputTokens: number | undefined;
	/** 总的 token 数量 */
	totalTokens: number | undefined;
}
