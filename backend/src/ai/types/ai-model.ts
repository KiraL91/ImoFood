export type AiModelOptions = {
  apiKey?: string;
  baseUrl: string;
  enabled: boolean;
  maxOutputTokens: number;
  model: string;
  provider: string;
  temperature: number;
  timeoutMs: number;
};

export type AiModelResponseFormat = {
  mimeType: "application/json";
  schema?: Record<string, unknown>;
};

export type AiModelPrompt = {
  metadata?: Record<string, unknown>;
  responseFormat?: AiModelResponseFormat;
  system: string;
  user: string;
};

export type AiModelCompletion = {
  content: string;
  model: string;
  provider: string;
};

export interface AiModelProvider {
  readonly modelName: string;
  readonly providerName: string;

  complete(prompt: AiModelPrompt): Promise<AiModelCompletion>;
  isEnabled(): boolean;
}
