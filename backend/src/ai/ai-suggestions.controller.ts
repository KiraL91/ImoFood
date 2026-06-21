import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { Permissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import { AiSuggestionsService } from "./ai-suggestions.service";
import { CreateFoodInfoSuggestionDto } from "./dto/create-food-info-suggestion.dto";
import { CreateMealIdeasSuggestionDto } from "./dto/create-meal-ideas-suggestion.dto";
import type { AiFoodInfoSuggestionResult } from "./types/food-info-suggestion";
import type {
  AiConfiguration,
  AiMealIdeasSuggestionResult,
} from "./types/meal-idea-suggestion";

@Controller("ai")
@UseGuards(AuthGuard, PermissionsGuard)
export class AiSuggestionsController {
  constructor(private readonly aiSuggestionsService: AiSuggestionsService) {}

  @Get("suggestions/config")
  @Permissions("ai-suggestions:read")
  getConfiguration(): AiConfiguration {
    return this.aiSuggestionsService.getConfiguration();
  }

  @Post("suggestions/meal-ideas")
  @Permissions("ai-suggestions:create")
  generateMealIdeas(
    @Body() createMealIdeasSuggestionDto: CreateMealIdeasSuggestionDto,
  ): Promise<AiMealIdeasSuggestionResult> {
    return this.aiSuggestionsService.generateMealIdeas(
      createMealIdeasSuggestionDto,
    );
  }

  @Post("suggestions/food-info")
  @Permissions("ai-suggestions:create")
  generateFoodInfo(
    @Body() createFoodInfoSuggestionDto: CreateFoodInfoSuggestionDto,
  ): Promise<AiFoodInfoSuggestionResult> {
    return this.aiSuggestionsService.generateFoodInfo(
      createFoodInfoSuggestionDto,
    );
  }
}
