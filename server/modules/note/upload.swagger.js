import { z } from "zod";

export const setupUploadSwagger = (registry) => {
  registry.registerPath({
    method: "post",
    path: "/api/notes/upload",
    tags: ["Note"],
    summary: "Upload image in note",
    description:
      "Upload an image along with room details using multipart/form-data",
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              roomId: z.string().openapi({ example: "6a5e20ee4c..." }),
              description: z
                .string()
                .optional()
                .openapi({ example: "Ex. description" }),
              image: z.string().openapi({
                type: "string",
                format: "binary",
                description: "Image file to upload (.png, .jpg, .webp)",
              }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Image uploaded successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Upload successfully" }),
              url: z.string().openapi({
                example: "http://localhost:5000/public/uploads/notes/img1.jpg",
              }),
            }),
          },
        },
      },
      400: {
        description:
          "Bad Request (e.g., missing file, invalid format, file too large)",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: false }),
              message: z
                .string()
                .openapi({ example: "Invalid input or missing file" }),
            }),
          },
        },
      },
    },
  });
};
