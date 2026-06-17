export type AiModelOptions = {
  enabled: boolean;
  model: string;
  provider: string;
  temperature: number;
};

export type AiModelPrompt = {
  metadata?: Record<string, unknown>;
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
