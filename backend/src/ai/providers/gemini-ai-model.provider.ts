import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

import { AiModelConfigService } from "../ai-model-config.service";
import type {
  AiModelCompletion,
  AiModelOptions,
  AiModelPrompt,
  AiModelProvider,
} from "../types/ai-model";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    status?: string;
  };
};

@Injectable()
export class GeminiAiModelProvider implements AiModelProvider {
  constructor(private readonly config: AiModelConfigService) {}

  get modelName(): string {
    return this.config.getOptions().model;
  }

  get providerName(): string {
    return this.config.getOptions().provider;
  }

  isEnabled(): boolean {
    const options = this.config.getOptions();

    return (
      options.enabled &&
      options.provider === "gemini" &&
      Boolean(options.apiKey) &&
      options.model !== "not-configured"
    );
  }

  async complete(prompt: AiModelPrompt): Promise<AiModelCompletion> {
    const options = this.config.getOptions();

    if (!this.isEnabled()) {
      throw new ServiceUnavailableException(
        "Gemini provider is not configured.",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(this.buildGenerateContentUrl(options), {
        body: JSON.stringify(this.buildRequestBody(prompt, options)),
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": options.apiKey ?? "",
        },
        method: "POST",
        signal: controller.signal,
      });

      const responseBody = (await response.json().catch(() => undefined)) as
        | GeminiGenerateContentResponse
        | undefined;

      if (!response.ok) {
        throw new ServiceUnavailableException(
          responseBody?.error?.message ??
            `Gemini request failed with status ${response.status}.`,
        );
      }

      const content = this.extractText(responseBody);

      return {
        content,
        model: options.model,
        provider: options.provider,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new GatewayTimeoutException("Gemini request timed out.");
      }

      if (
        error instanceof BadGatewayException ||
        error instanceof GatewayTimeoutException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        error instanceof Error
          ? error.message
          : "Gemini request could not be completed.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildGenerateContentUrl(options: AiModelOptions): string {
    const baseUrl = options.baseUrl.replace(/\/+$/, "");

    return `${baseUrl}/v1beta/models/${options.model}:generateContent`;
  }

  private buildRequestBody(prompt: AiModelPrompt, options: AiModelOptions) {
    return {
      contents: [
        {
          parts: [
            {
              text: prompt.user,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens,
        responseJsonSchema: prompt.responseFormat?.schema,
        responseMimeType: prompt.responseFormat?.mimeType,
        temperature: options.temperature,
      },
      system_instruction: {
        parts: [
          {
            text: prompt.system,
          },
        ],
      },
    };
  }

  private extractText(responseBody?: GeminiGenerateContentResponse): string {
    const content =
      responseBody?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter((text): text is string => Boolean(text))
        .join("\n")
        .trim() ?? "";

    if (!content) {
      throw new BadGatewayException("Gemini response did not include text.");
    }

    return content;
  }
}
