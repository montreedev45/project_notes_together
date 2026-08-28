import z from "zod";

export const setupUserSwagger = (registry) => {
  registry.registerPath({
    method: "get",
    path: "/api/user/profile",
    tags: ["User"],
    summary: "Fetch profile",
    description: "Fetch profile of user",
    responses: {
      200: {
        description: "Fetch profile successfully",
        content: {
          "application/json": {
            schema: z.object({
              user: z.object({
                _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                username: z.string().openapi({ example: "usertest" }),
                email: z.email().openapi({ example: "usertest@gmail.com" }),
                avatar: z.string().openapi({ example: "#f9aaaa" }),
                __v: z.number().openapi({ example: 0 }),
                updatedAt: z
                  .string()
                  .openapi({ example: "2024-08-02T11:51:55.867Z" }),
                isDeleted: z.boolean().openapi({ example: false }),
                plan: z.string().openapi({ example: "teams" }),
              }),
            }),
          },
        },
      },
    },
  });
};
