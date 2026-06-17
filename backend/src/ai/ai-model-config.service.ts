import { Injectable } from "@nestjs/common";

import type { AiModelOptions } from "./types/ai-model";

const defaultTemperature = 0.2;

@Injectable()
export class AiModelConfigService {
  getOptions(): AiModelOptions {
    return {
      enabled: process.env.AI_ENABLED === "true",
      model: process.env.AI_MODEL?.trim() || "not-configured",
      provider: process.env.AI_PROVIDER?.trim() || "disabled",
      temperature: this.getTemperature(),
    };
  }

  private getTemperature(): number {
    const rawTemperature = process.env.AI_TEMPERATURE;

    if (!rawTemperature) {
      return defaultTemperature;
    }

    const parsedTemperature = Number(rawTemperature);

    if (!Number.isFinite(parsedTemperature)) {
      return defaultTemperature;
    }

    return Math.min(Math.max(parsedTemperature, 0), 2);
  }
}
