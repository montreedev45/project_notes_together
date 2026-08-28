import { z } from "zod";

export const setupPlanSwagger = (registry) => {
  registry.registerPath({
    method: "get",
    path: "/api/plans",
    tags: ["Plan"],
    summary: "Get all plans",
    description: "Get all plans successfully",
    responses: {
      200: {
        description: "Get all plans successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              data: z
                .array(
                  z.object({
                    _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                    plan: z.string().openapi({ example: "business" }),
                    price: z.number().openapi({ example: 100 }),
                    description: z.array(z.string()).openapi({
                      example: ["unlimited rooms", "unlimited colleague"],
                    }),
                    roomLimit: z.number().openapi({ example: 5 }),
                    colleagueLimit: z.number().openapi({ example: 10 }),
                  }),
                )
                .openapi({
                  example: [
                    {
                      _id: "6a5dcdcbcf...",
                      plan: "business",
                      price: 100,
                      description: ["unlimited rooms", "unlimited colleague"],
                      roomLimit: 5,
                      colleagueLimit: 10,
                    },
                  ],
                }),
            }),
          },
        },
      },
    },
  });
};
