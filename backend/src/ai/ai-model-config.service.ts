import { Injectable } from "@nestjs/common";

import type { AiModelOptions } from "./types/ai-model";

const defaultBaseUrl = "https://generativelanguage.googleapis.com";
const defaultMaxOutputTokens = 1200;
const defaultTemperature = 0.2;
const defaultTimeoutMs = 12_000;

@Injectable()
export class AiModelConfigService {
  getOptions(): AiModelOptions {
    return {
      apiKey:
        process.env.AI_API_KEY?.trim() ||
        process.env.GEMINI_API_KEY?.trim() ||
        undefined,
      baseUrl: process.env.AI_BASE_URL?.trim() || defaultBaseUrl,
      enabled: process.env.AI_ENABLED === "true",
      maxOutputTokens: this.getNumberOption(
        process.env.AI_MAX_OUTPUT_TOKENS,
        defaultMaxOutputTokens,
        256,
        8192,
      ),
      model: process.env.AI_MODEL?.trim() || "not-configured",
      provider: process.env.AI_PROVIDER?.trim().toLowerCase() || "disabled",
      temperature: this.getNumberOption(
        process.env.AI_TEMPERATURE,
        defaultTemperature,
        0,
        2,
      ),
      timeoutMs: this.getNumberOption(
        process.env.AI_TIMEOUT_MS,
        defaultTimeoutMs,
        1_000,
        60_000,
      ),
    };
  }

  private getNumberOption(
    rawValue: string | undefined,
    fallback: number,
    min: number,
    max: number,
  ): number {
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      return fallback;
    }

    return Math.min(Math.max(parsedValue, min), max);
  }
}
