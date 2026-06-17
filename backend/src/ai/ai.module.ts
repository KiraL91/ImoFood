import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AiModelConfigService } from "./ai-model-config.service";
import { AiSuggestionsController } from "./ai-suggestions.controller";
import { AiSuggestionsService } from "./ai-suggestions.service";
import { AI_MODEL_PROVIDER } from "./ai.tokens";
import { PlaceholderAiModelProvider } from "./providers/placeholder-ai-model.provider";

@Module({
  controllers: [AiSuggestionsController],
  imports: [AuthModule, PrismaModule],
  providers: [
    AiModelConfigService,
    AiSuggestionsService,
    {
      provide: AI_MODEL_PROVIDER,
      useClass: PlaceholderAiModelProvider,
    },
  ],
})
export class AiModule {}
