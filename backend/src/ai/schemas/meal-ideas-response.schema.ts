export const mealIdeasResponseSchema = {
  properties: {
    suggestions: {
      items: {
        properties: {
          foodNames: {
            items: {
              type: "string",
            },
            type: "array",
          },
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
        required: ["title", "items", "foodNames", "tags"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["suggestions"],
  type: "object",
} satisfies Record<string, unknown>;
