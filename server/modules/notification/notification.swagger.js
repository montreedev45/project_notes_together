import { z } from "zod";
import { deleteNotificationSchema } from "./notification.schema.js";

export const setupNotificationSwagger = (registry) => {
  registry.register("Notification_DeleteNotic", deleteNotificationSchema);

  registry.registerPath({
    method: "get",
    path: "/api/notifications",
    tags: ["Notification"],
    summary: "Get notifications of user",
    description:
      "Retrieve a list of all notifications for the current authenticated user",
    responses: {
      200: {
        description: "Get notifications successfully",
        content: {
          "application/json": {
            schema: z
              .array(
                z.object({
                  _id: z.string().openapi({ example: "6a095fdd48..." }),
                  sender: z
                    .object({
                      _id: z.string().openapi({ example: "6a7c889825..." }),
                      username: z.string().openapi({ example: "johndoe" }),
                      avatar: z
                        .string()
                        .optional()
                        .openapi({ example: "#e4f4a8" }),
                    })
                    .openapi({ description: "Populated sender details" }),
                  type: z.string().openapi({ example: "comment" }),
                  isRead: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2026-08-25T13:19:47Z" }),
                }),
              )
              .openapi({
                description: "List of notifications",
              }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/api/notifications/mark-as-read",
    tags: ["Notification"],
    summary: "Read notification",
    description: "Read notification of user",
    responses: {
      200: {
        description: "Mark as read successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Mark as read successfully" }),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/notifications/{noticId}",
    tags: ["Notification"],
    summary: "Delete notification",
    description: "Delete notification by id",
    request: {
      params: deleteNotificationSchema.shape.params,
    },
    responses: {
      200: {
        description: "Delete notification successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Delete notification successfully" }),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/notifications/all",
    tags: ["Notification"],
    summary: "Delete all notifications",
    description: "Delete all notifications",
    responses: {
      200: {
        description: "All notifications cleared successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Clear all notifications successfully" }), // 🟢 3. เปลี่ยนจาก message เป็น example
            }),
          },
        },
      },
      500: {
        description: "Unexpected response from server",
      },
    },
  });
};
