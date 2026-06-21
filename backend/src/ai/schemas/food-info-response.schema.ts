export const foodInfoResponseSchema = {
  properties: {
    suggestion: {
      properties: {
        category: {
          type: "string",
        },
        notes: {
          type: "string",
        },
        status: {
          enum: ["allowed", "testing", "caution", "avoid"],
          type: "string",
        },
        suggestedServing: {
          type: "string",
        },
        tags: {
          items: {
            type: "string",
          },
          type: "array",
        },
        tolerance: {
          type: "integer",
        },
      },
      required: ["category", "status", "tolerance", "suggestedServing", "tags"],
      type: "object",
    },
  },
  required: ["suggestion"],
  type: "object",
} satisfies Record<string, unknown>;
