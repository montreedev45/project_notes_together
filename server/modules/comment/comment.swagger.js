import { z } from "zod";
import {
  addCommentSchema,
  getCommentSchema,
  getStickerSchema,
} from "./comment.schema.js";

export const setupCommentSwagger = (registry) => {
  registry.register("Comment_GetComment", getCommentSchema);
  registry.register("Comment_AddComment", addCommentSchema);
  registry.register("Comment_GetSticker", getStickerSchema)

  // get comment
  registry.registerPath({
    method: "get",
    path: "/api/comments/",
    tags: ["Comment"],
    summary: "Get all comments",
    request: {
      // โยน Zod Schema ใส่ query ตรงๆ ห้ามมี content / application/json มาครอบ
      query: getCommentSchema.shape.query,
    },
    responses: {
      200: {
        description: "Fetch comments successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Fetch comments successfully" }),
              // ถ้าเป็นหลายคอมเมนต์ ควรใช้ z.array()
              comments: z.array(z.unknown()).openapi({
                description: "List of comments",
              }),
            }),
          },
        },
      },
    },
  });

  // add comment
  registry.registerPath({
    method: "post",
    path: "/api/comments/",
    tags: ["Comment"],
    summary: "Create a new comment",
    request: {
      body: {
        content: {
          "application/json": {
            schema: addCommentSchema.shape.body,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Comment created successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "add new comment successfully" }),
              populatedComment: z
                .object({
                  room: z.string().openapi({ example: "6a095fdd48200b..." }),
                  sender: z.object({
                    _id: z.string().openapi({ example: "69beaca7c2..." }),
                    username: z.string().openapi({ example: "userTest" }),
                    avatar: z.string().openapi({ example: "#f9aaaa" }),
                  }),
                  _id: z.string().openapi({ example: "64b1f2..." }),
                  text: z.string().openapi({ example: "Hello!" }),
                  type: z.string().openapi({ example: "text" }),
                  stickerUrl: z.string().openapi({ example: "" }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-25T07:44:12.741Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2026-08-25T07:44:12.741Z" }),
                })
                .openapi({
                  description: "The newly created comment with sender details",
                }),
            }),
          },
        },
      },
    },
  });

  // get all sticker
  registry.registerPath({
    method: "get",
    path: "/api/comments/stickers/all",
    tags: ["Comment"],
    summary: "Get all stickers",
    description:
      "Fetch a list of all sticker filenames from the public directory.",
    responses: {
      200: {
        description: "Get all stickers successfully",
        content: {
          "application/json": {
            schema: z.object({
              stickers: z.array(z.string()).openapi({
                example: ["cat_01.png", "dog_02.webp", "smile.jpg"],
                description: "Array of image filenames",
              }),
            }),
          },
        },
      },
      500: {
        description: "Internal Server Error (Unable to scan directory)",
      },
    },
  });

  // get sticker
  registry.registerPath({
    method: "get",
    path: "/api/comments/sticker",
    tags: ["Comment"],
    summary: "Get sticker",
    description: "Get sticker",
    request: {
      query: getStickerSchema.shape.query,
    },
    responses: {
      200: {
        description:"Get sticker successfully",
        content: {
          "image/*": {
            schema: z.string().openapi({
              type: "string",
              format: "binary",
              description: "The binary image data",
              example: "<Binary Image File Data>"
            }),
          },
        },
      },
      404: {
        description: "Image not found",
      },
    },
  });
};
