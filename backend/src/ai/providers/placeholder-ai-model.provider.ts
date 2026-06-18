import { Injectable, ServiceUnavailableException } from "@nestjs/common";

import { AiModelConfigService } from "../ai-model-config.service";
import type { AiModelCompletion, AiModelProvider } from "../types/ai-model";

@Injectable()
export class PlaceholderAiModelProvider implements AiModelProvider {
  constructor(private readonly config: AiModelConfigService) {}

  get modelName(): string {
    return this.config.getOptions().model;
  }

  get providerName(): string {
    return this.config.getOptions().provider;
  }

  isEnabled(): boolean {
    return false;
  }

  complete(): Promise<AiModelCompletion> {
    throw new ServiceUnavailableException(
      "AI model provider is not configured yet.",
    );
  }
}
