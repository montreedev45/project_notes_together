import { success, z } from "zod";
import {
  createRoomSchema,
  deleteMemberSchema,
  getAllRoomsSchema,
  getRoomByIdSchema,
  getRoomsSchema,
  getTrashRoomsSchema,
  invitedUsersSchema,
  joinLinkSchema,
  joinRoomSchema,
  leaveRoomSchema,
  permanentlyDeleteSchema,
  restoreRoomSchema,
  softDeleteSchema,
  transferOwnershipSchema,
  updateCodeRoomSchema,
  updatedRoomSchema,
  updateLinkShareRoomSchema,
  updateRoleSchema,
} from "./room.schema.js";

export const setupRoomSwagger = (registry) => {
  registry.register("Room_CreateRoom", createRoomSchema);
  registry.register("Room_GetMyRoom", getRoomsSchema);
  registry.register("Room_GetAllRoom", getAllRoomsSchema);
  registry.register("Room_GetRoomById", getRoomByIdSchema);
  registry.register("Room_JoinRoom", joinRoomSchema);
  registry.register("Room_LeaveRoom", leaveRoomSchema);
  registry.register("Room_UpdateRole", updateRoleSchema);
  registry.register("Room_SoftDelete", softDeleteSchema);
  registry.register("Room_GetTrashRoom", getTrashRoomsSchema);
  registry.register("Room_Restore", restoreRoomSchema);
  registry.register("Room_PermanentlyDelete", permanentlyDeleteSchema);
  registry.register("Room_Update", updatedRoomSchema);
  registry.register("Room_DeleteMember", deleteMemberSchema);
  registry.register("Room_JoinLink", joinLinkSchema);
  registry.register("Room_InviteColleague", invitedUsersSchema);
  registry.register("Room_TransferOwnership", transferOwnershipSchema);
  registry.register("Room_UpdateCodeRoom", updateCodeRoomSchema);
  registry.register("Room_UpdateLinkShareRoom", updateLinkShareRoomSchema)

  // create room
  registry.registerPath({
    method: "post",
    path: "/api/rooms",
    tags: ["Room"],
    summary: "Create room",
    description: "Create a new room",
    request: {
      body: {
        content: {
          "application/json": {
            schema: createRoomSchema.shape.body,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Room created successfully",
        content: {
          "application/json": {
            schema: z.object({
              populate: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description:
                    "The newly created room object with populated fields",
                }),
            }),
          },
        },
      },
    },
  });

  // get myroom
  registry.registerPath({
    method: "post",
    path: "/api/rooms/my-rooms",
    tags: ["Room"],
    summary: "Fetch my rooms",
    description: "Fetch my rooms",
    request: {
      body: {
        content: {
          "application/json": {
            schema: getRoomsSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Get my rooms",
        content: {
          "application/json": {
            schema: z.object({
              rooms: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // get all room
  registry.registerPath({
    method: "post",
    path: "/api/rooms/all-rooms",
    tags: ["Room"],
    summary: "Get all rooms",
    description: "Get all rooms of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: getAllRoomsSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Get all rooms successfully",
        content: {
          "application/json": {
            schema: z.object({
              rooms: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // get room by id
  registry.registerPath({
    method: "get",
    path: "/api/rooms/{roomId}",
    tags: ["Room"],
    summary: "Get room by id",
    description: "Get room by id of user",
    request: {
      params: getRoomByIdSchema.shape.params,
    },
    responses: {
      200: {
        description: "Fetch room successfully",
        content: {
          "application/json": {
            schema: z.object({
              room: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // join room
  registry.registerPath({
    method: "post",
    path: "/api/rooms/join",
    tags: ["Room"],
    summary: "Join room",
    description: "Join room",
    request: {
      body: {
        content: {
          "application/json": {
            schema: joinRoomSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Join room successfully",
        content: {
          "application/json": {
            schema: z.object({
              joinedRoom: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // leave room
  registry.registerPath({
    method: "post",
    path: "/api/rooms/leave",
    tags: ["Room"],
    summary: "Leave room",
    description: "Leave room",
    request: {
      body: {
        content: {
          "application/json": {
            schema: leaveRoomSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Leave room successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "leave rooom successfully" }),
            }),
          },
        },
      },
    },
  });

  // update role
  registry.registerPath({
    method: "put",
    path: "/api/rooms/update-role",
    tags: ["Room"],
    summary: "Update role",
    description: "Update role of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: updateRoleSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Update role successfully",
        content: {
          "application/json": {
            schema: z.object({
              roomId: z.string().openapi({ example: "6a5dcdcbcf..." }),
              memberId: z.string().openapi({ example: "6a5dcdcbcf..." }),
              role: z
                .enum(["editor", "viewer", "commenter"])
                .openapi({ example: "editor" }),
            }),
          },
        },
      },
    },
  });

  // soft delete
  registry.registerPath({
    method: "post",
    path: "/api/rooms/delete/{roomId}",
    tags: ["Room"],
    summary: "Soft delete room",
    description: "Soft delete room (set  isDelete: true)",
    request: {
      params: softDeleteSchema.shape.params,
    },
    responses: {
      200: {
        description: "Soft delete successfully",
        content: {
          "application/json": {
            schema: z.object({
              roomUpdated: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // get trash room
  registry.registerPath({
    method: "get",
    path: "/api/rooms/trash",
    tags: ["Room"],
    summary: "Get trash room",
    description: "Get trash room of user",
    request: {
      query: getTrashRoomsSchema.shape.query,
    },
    responses: {
      200: {
        description: "Get trash room successfully",
        content: {
          "application/json": {
            schema: z.object({
              trashRooms: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // restore room
  registry.registerPath({
    method: "post",
    path: "/api/rooms/restore/{roomId}",
    tags: ["Room"],
    summary: "Restore room",
    description: "Restore room of user",
    request: {
      params: restoreRoomSchema.shape.params,
    },
    responses: {
      200: {
        description: "Restore room successfully",
        content: {
          "application/json": {
            schema: z.object({
              restoredRoom: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // permanently delete
  registry.registerPath({
    method: "delete",
    path: "/api/rooms/permanent/{roomId}",
    tags: ["Room"],
    summary: "Delete room",
    description: "Delete room of user",
    request: {
      params: permanentlyDeleteSchema.shape.params,
    },
    responses: {
      200: {
        description: "Delete successfuly",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Permanently deleted room successfully" }),
            }),
          },
        },
      },
    },
  });

  // permanently all delete
  registry.registerPath({
    method: "delete",
    path: "/api/rooms/permanent-all",
    tags: ["Room"],
    summary: "Permanent all delete",
    description: "Permanent all delete",
    responses: {
      200: {
        description: "Permanent all delete successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Delete all room succesfully" }),
            }),
          },
        },
      },
    },
  });

  // update room
  registry.registerPath({
    method: "put",
    path: "/api/rooms/",
    tags: ["Room"],
    summary: "Update room",
    description: "Update room",
    request: {
      body: {
        content: {
          "application/json": {
            schema: updatedRoomSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Update room successfully",
        content: {
          "application/json": {
            schema: z.object({
              updatedRoom: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // delete member
  registry.registerPath({
    method: "put",
    path: "/api/rooms/delete-member",
    tags: ["Room"],
    summary: "Delete member",
    description: "Delete member",
    request: {
      body: {
        content: {
          "application/json": {
            schema: deleteMemberSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Delete member successfully",
        content: {
          "application/json": {
            schema: z.object({
              updatedRoom: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // join link
  registry.registerPath({
    method: "get",
    path: "/api/rooms/join-link/{shareLinkToken}/{role}",
    tags: ["Room"],
    summary: "Join room with link",
    description: "Join room with link by attach shareLinkToken, role",
    request: {
      params: joinLinkSchema.shape.params,
    },
    responses: {
      200: {
        description: "Join Room with link successfully",
        content: {
          "application/json": {
            schema: z
              .object({
                _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                name: z.string().openapi({ example: "General Room" }),
                description: z
                  .string()
                  .openapi({ example: "test description" }),
                owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                members: z
                  .array(
                    z.object({
                      _id: z.string(),
                      user: z.string(),
                      role: z.enum(["editor", "viewer", "commenter"]),
                    }),
                  )
                  .openapi({
                    example: [
                      {
                        _id: "6a5dcdcbcf...",
                        user: "usertest",
                        role: "editor",
                      },
                      {
                        _id: "1b4dcdcbcf...",
                        user: "usertest",
                        role: "editor",
                      },
                    ],
                  }),
                isPrivate: z.boolean().openapi({ example: true }),
                color: z.string().openapi({ example: "#e25a2f" }),
                code: z.string().openapi({ example: "215468" }),
                invitedUsers: z
                  .array(z.string())
                  .openapi({ example: ["6a5dcdcbcf..."] }),
                isDeleted: z.boolean().openapi({ example: false }),
                isOnlineStatus: z.boolean().openapi({ example: true }),
                isLastEditTime: z.boolean().openapi({ example: true }),
                isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                isAllowLinkSharing: z.boolean().openapi({ example: false }),
                isAllowCodeSharing: z.boolean().openapi({ example: false }),
                createdAt: z
                  .string()
                  .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                updatedAt: z
                  .string()
                  .openapi({ example: "2024-08-27T07:09:49.649Z" }),
              })
              .openapi({
                description: "The newly room object",
              }),
          },
        },
      },
    },
  });

  // invite colleague
  registry.registerPath({
    method: "post",
    path: "/api/rooms/invite-colleague",
    tags: ["Room"],
    summary: "Invite colleague",
    description: "Invite colleague (not join room)",
    request: {
      body: {
        content: {
          "application/json": {
            schema: invitedUsersSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Invite colleague successfully" }),
              invitedUsers: z.array(z.unknown()).openapi({
                example: ["6a910298976db70f...", "6a910298976db70f... "],
              }),
            }),
          },
        },
      },
    },
  });

  // transfer ownership
  registry.registerPath({
    method: "post",
    path: "/api/rooms/transfer-ownership",
    tags: ["Room"],
    summary: "Transfer ownership",
    description: "Transfer ownership",
    request: {
      body: {
        content: {
          "application/json": {
            schema: transferOwnershipSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Transfer ownership",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z
                .string()
                .openapi({ example: "transfer ownership successfully" }),
              data: z
                .object({
                  _id: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  name: z.string().openapi({ example: "General Room" }),
                  description: z
                    .string()
                    .openapi({ example: "test description" }),
                  owner: z.string().openapi({ example: "6a5dcdcbcf..." }),
                  members: z
                    .array(
                      z.object({
                        _id: z.string(),
                        user: z.string(),
                        role: z.enum(["editor", "viewer", "commenter"]),
                      }),
                    )
                    .openapi({
                      example: [
                        {
                          _id: "6a5dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                        {
                          _id: "1b4dcdcbcf...",
                          user: "usertest",
                          role: "editor",
                        },
                      ],
                    }),
                  isPrivate: z.boolean().openapi({ example: true }),
                  color: z.string().openapi({ example: "#e25a2f" }),
                  code: z.string().openapi({ example: "215468" }),
                  invitedUsers: z
                    .array(z.string())
                    .openapi({ example: ["6a5dcdcbcf..."] }),
                  isDeleted: z.boolean().openapi({ example: false }),
                  isOnlineStatus: z.boolean().openapi({ example: true }),
                  isLastEditTime: z.boolean().openapi({ example: true }),
                  isPeopleJoinRoom: z.boolean().openapi({ example: true }),
                  isAllowLinkSharing: z.boolean().openapi({ example: false }),
                  isAllowCodeSharing: z.boolean().openapi({ example: false }),
                  createdAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                  updatedAt: z
                    .string()
                    .openapi({ example: "2024-08-27T07:09:49.649Z" }),
                })
                .openapi({
                  description: "The newly room object",
                }),
            }),
          },
        },
      },
    },
  });

  // update code room
  registry.registerPath({
    method: "put",
    path: "/api/rooms/update-code",
    tags: ["Room"],
    summary: "Update code room",
    description: "Update code room by random 6 digitcode",
    request: {
      body: {
        content: {
          "application/json": {
            schema: updateCodeRoomSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Update code successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Updated room code successfully" }),
              newCode: z.string().openapi({ example: "123456" }),
            }),
          },
        },
      },
    },
  });

  // update link share room
  registry.registerPath({
    method: "put",
    path: "/api/rooms/update-link-share/{roomId}",
    tags: ["Room"],
    summary: "Update link share room",
    description: "Update link share room by use role, access",
    request: {
      params: updateLinkShareRoomSchema.shape.params,
      body: {
        content: {
          "application/json": {
            schema: updateLinkShareRoomSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Update link share room successfully",
        content: {
          "application/json": {
            schema: z.object({
              token: z.string().openapi({ example: "a530715f7970abb..." }),
              access: z
                .enum(["anyone", "invited"])
                .openapi({ example: "anyone" }),
              expiredAt: z
                .string()
                .openapi({ example: "2024-08-29T07:33:59.216Z" }),
              role: z
                .enum(["editor", "viewer", "commenter"])
                .openapi({ example: "editor" }),
            }),
          },
        },
      },
    },
  });
};