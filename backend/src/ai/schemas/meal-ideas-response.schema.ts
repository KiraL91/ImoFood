export const mealIdeasResponseSchema = {
  properties: {
    suggestions: {
      items: {
        properties: {
          items: {
            items: {
              type: "string",
            },
            type: "array",
          },
          reason: {
            type: "string",
          },
          tags: {
            items: {
              type: "string",
            },
            type: "array",
          },
          title: {
            type: "string",
          },
        },
        required: ["title", "items", "tags"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["suggestions"],
  type: "object",
} satisfies Record<string, unknown>;
