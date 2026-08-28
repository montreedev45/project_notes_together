import { z } from "zod";

const idSchema = (fieldName) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be string`,
    })
    .trim()
    .min(5, `${fieldName} must be at least 5 characters`)
    .max(30, `${fieldName} cannot exceed 30 characters`);

export const createRoomSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .min(1, "Name must be at least 1 character")
        .max(10, "Name cannot exceed 10 characters")
        .openapi({ example: "test room1" }),

      description: z
        .string({
          required_error: "Description is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .min(1, "Description must be at least 1 character")
        .max(50, "Description cannot exceed 50 characters")
        .openapi({ example: "test description room1" }),

      isPrivate: z
        .boolean({
          required_error: "isPrivate is required",
          invalid_type_error: "isPrivate must be true or false",
        })
        .openapi({
          example: true,
        }),

      selectedColor: z
        .string({
          required_error: "Selected color is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .min(3, "Select color must be at least 3 characters")
        .max(10, "Select color cannot exceed 10 characters")
        .openapi({ example: "#2ea56e" }),
    })
    .strict(),
});

export const getRoomsSchema = z.object({
  body: z.object({
    criteria: z
      .enum(["all", "owner", "public", "private"], {
        errorMap: () => ({
          message: "Type must be all, owner, public, or private",
        }),
      })
      .openapi({ example: "all" }),

    searchTerm: z
      .string({
        invalid_type_error: "Search term must be a string",
      })
      .trim()
      .max(20, "Search term cannot exceed 20 characters")
      .openapi({ example: "room1" })
      .optional(),
  }),
});

export const getAllRoomsSchema = z.object({
  body: z.object({
    criteria: z
      .enum(["all", "owner", "public", "private"], {
        errorMap: () => ({
          message: "Type must be all, owner, public, or private",
        }),
      })
      .openapi({ example: "all" }),

    searchTerm: z
      .string({
        invalid_type_error: "Search term must be a string",
      })
      .trim()
      .max(20, "Search term cannot exceed 20 characters")
      .openapi({ example: "room1" })
      .optional(),
  }),
});

export const getRoomByIdSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a5dcdcbcf..." }),
    })
    .strict(),
});

export const joinRoomSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a5dcdcbcf..." }),
      code: z
        .string({ invalid_type_error: "Must be a string" })
        .trim()
        .max(6, "Code cannot exceed 6 characters")
        .transform((val) => (val === "" ? undefined : val)) // ถ้าส่ง "" มา ให้เปลี่ยนเป็น undefined
        .openapi({ example: "123456" })
        .optional(),
    })
    .strict(),
});

export const leaveRoomSchema = z.object({
  body: z.object({
    roomId: idSchema("Room id").openapi({ example: "6a5dcdcbcf..." }),
  }),
});

export const updateRoleSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a5dcdcbcf..." }),
      memberId: idSchema("Member id").openapi({ example: "6a5dcdcbcf..." }),
      role: z
        .enum(["editor", "viewer", "commenter"], {
          errorMap: () => ({
            message: "Role must be editor, viewer, or commenter",
          }),
        })
        .openapi({ example: "editor" }),
    })
    .strict(),
});

export const softDeleteSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a5dcdcbcf..." }),
    })
    .strict(),
});

export const getTrashRoomsSchema = z.object({
  query: z.object({
    searchTerm: z
      .string({
        invalid_type_error: "Search term must be a string",
      })
      .trim()
      .max(20, "Search term cannot exceed 20 characters")
      .openapi({ example: "room1" })
      .optional(),
  }),
});

export const restoreRoomSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a8fe2bd71835..." }),
    })
    .strict(),
});

export const permanentlyDeleteSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a902d0b0187..." }),
    })
    .strict(),
});

export const updatedRoomSchema = z.object({
  body: z.object({
    roomId: idSchema("Room id").openapi({ example: "6a902d0b0187..." }),
    newData: z
      .object({
        name: z
          .string({
            required_error: "Name is required",
            invalid_type_error: "Must be a string",
          })
          .trim()
          .max(12, "Name cannot exceed 12 characters")
          .openapi({ example: "room1" })
          .optional(),
        description: z
          .string({
            required_error: "Description is required",
            invalid_type_error: "Must be a string",
          })
          .trim()
          .max(150, "Description cannot exceed 150 characters")
          .openapi({ example: "test description" })
          .optional(),
        color: z
          .string({
            required_error: "Color is required",
            invalid_type_error: "Must be a string",
          })
          .trim()
          .min(3, "Color must be at least 3 characters")
          .max(10, "Color cannot exceed 10 characters")
          .openapi({ example: "#e21da5" })
          .optional(),
        isPrivate: z
          .boolean({
            invalid_type_error: "isPrivate must be true or false",
          })
          .openapi({ example: true })
          .optional(),
        isOnlineStatus: z
          .boolean({
            invalid_type_error: "isOnlineStatus must be true or false",
          })
          .openapi({ example: true })
          .optional(),
        isLastEditTime: z
          .boolean({
            invalid_type_error: "isLastEditTime must be true or false",
          })
          .openapi({ example: true })
          .optional(),
        isPeopleJoinRoom: z
          .boolean({
            invalid_type_error: "isPeopleJoinRoom must be true or false",
          })
          .openapi({ example: true })
          .optional(),
        isAllowLinkSharing: z
          .boolean({
            invalid_type_error: "isAllowLinkSharing must be true or false",
          })
          .openapi({ example: false })
          .optional(),
        isAllowCodeSharing: z
          .boolean({
            invalid_type_error: "isAllowCodeSharing must be true or false",
          })
          .openapi({ example: false })
          .optional(),
      })
      .strict(),
  }),
});

export const deleteMemberSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a902d0b0187..." }),
      memberId: idSchema("Member id").openapi({ example: "6a902d0b0187..." }),
    })
    .strict(),
});

export const joinLinkSchema = z.object({
  params: z.object({
    shareLinkToken: z
      .string({
        required_error: "Share link token is required",
        invalid_type_error: "Must be string",
      })
      .trim()
      .min(10, "Share link token must be at least 20 characters")
      .max(100, "Share link token cannot exceed 100 characters")
      .openapi({ example: "c1046ce188f0c7b342..." }),
    role: z
      .enum(["editor", "viewer", "commenter"], {
        errorMap: () => ({
          message: "Role must be editor, viewer, or commenter",
        }),
      })
      .openapi({ example: "commenter" }),
  }),
});

export const invitedUsersSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a910298976db..." }),
      userId: idSchema("User id").openapi({ example: "6a910298976db..." }),
    })
    .strict(),
});

export const transferOwnershipSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "6a910298976db..." }),
      newOwnerId: idSchema("New owner id").openapi({
        example: "6a910298976...",
      }),
    })
    .strict(),
});

export const updateCodeRoomSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id").openapi({ example: "69beaca7c217e..." }),
    })
    .strict(),
});

export const updateLinkShareRoomSchema = z.object({
  params: z.object({
    roomId: idSchema("Room id").openapi({ example: "6a095fdd48200b5..." }),
  }),
  body: z.object({
    role: z
      .enum(["viewer", "editor", "commenter"], {
        errorMap: () => ({
          message: "Role must be editor, viewer, or commenter",
        }),
      })
      .openapi({ example: "commenter" }),
    access: z
      .enum(["anyone", "invited"], {
        errorMap: () => ({ message: "Access must be anyone, invited" }),
      })
      .default("anyone")
      .openapi({ example: "anyone" }),
  }),
});
