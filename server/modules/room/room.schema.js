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
        .max(10, "Name cannot exceed 10 characters"),

      description: z
        .string({
          required_error: "Description is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .min(1, "Description must be at least 1 character")
        .max(50, "Description cannot exceed 50 characters"),

      isPrivate: z.boolean({
        required_error: "isPrivate is required",
        invalid_type_error: "isPrivate must be true or false",
      }),

      selectedColor: z
        .string({
          required_error: "Selected color is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .min(3, "Select color must be at least 3 characters")
        .max(10, "Select color cannot exceed 10 characters"),
    })
    .strict(),
});

export const getRoomsSchema = z.object({
  body: z.object({
    criteria: z.enum(["all", "owner", "public", "private"], {
      errorMap: () => ({
        message: "Type must be all, owner, public, or private",
      }),
    }),

    searchTerm: z
      .string({
        invalid_type_error: "Search term must be a string",
      })
      .trim()
      .max(20, "Search term cannot exceed 20 characters")
      .optional(),
  }),
});

export const getAllRoomsSchema = z.object({
  body: z.object({
    criteria: z.enum(["all", "owner", "public", "private"], {
      errorMap: () => ({
        message: "Type must be all, owner, public, or private",
      }),
    }),

    searchTerm: z
      .string({
        invalid_type_error: "Search term must be a string",
      })
      .trim()
      .max(20, "Search term cannot exceed 20 characters")
      .optional(),
  }),
});

export const getRoomByIdSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id"),
    })
    .strict(),
});

export const joinRoomSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id"),
      code: z
        .string({ invalid_type_error: "Must be a string" })
        .trim()
        .max(6, "Code cannot exceed 6 characters")
        .transform((val) => (val === "" ? undefined : val)) // ถ้าส่ง "" มา ให้เปลี่ยนเป็น undefined
        .optional(),
    })
    .strict(),
});

export const leaveRoomSchema = z.object({
  body: z.object({
    roomId: idSchema("Room id"),
  }),
});

export const updateRoleSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id"),
      memberId: idSchema("Member id"),
      role: z.enum(["editor", "viewer", "commenter"], {
        errorMap: () => ({
          message: "Role must be editor, viewer, or commenter",
        }),
      }),
    })
    .strict(),
});

export const softDeleteSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id"),
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
      .optional(),
  }),
});

export const restoreRoomSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id"),
    })
    .strict(),
});

export const permanentlyDeleteSchema = z.object({
  params: z
    .object({
      roomId: idSchema("Room id"),
    })
    .strict(),
});

export const updatedRoomSchema = z.object({
  body: z.object({
    roomId: idSchema("Room id"),
    newData: z.object({
      name: z
        .string({
          required_error: "Name is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .max(12, "Name cannot exceed 12 characters")
        .optional(),
      description: z
        .string({
          required_error: "Description is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .max(150, "Description cannot exceed 150 characters")
        .optional(),
      color: z
        .string({
          required_error: "Color is required",
          invalid_type_error: "Must be a string",
        })
        .trim()
        .min(3, "Color must be at least 3 characters")
        .max(10, "Color cannot exceed 10 characters")
        .optional(),
      isPrivate: z
        .boolean({
          invalid_type_error: "isPrivate must be true or false",
        })
        .optional(),
      isOnlineStatus: z
        .boolean({
          invalid_type_error: "isOnlineStatus must be true or false",
        })
        .optional(),
      isLastEditTime: z
        .boolean({
          invalid_type_error: "isLastEditTime must be true or false",
        })
        .optional(),
      isPeopleJoinRoom: z
        .boolean({
          invalid_type_error: "isPeopleJoinRoom must be true or false",
        })
        .optional(),
      isAllowLinkSharing: z
        .boolean({
          invalid_type_error: "isAllowLinkSharing must be true or false",
        })
        .optional(),
      isAllowCodeSharing: z
        .boolean({
          invalid_type_error: "isAllowCodeSharing must be true or false",
        })
        .optional(),
    }).strict(),
  }),
});

export const deleteMemberSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id"),
      memberId: idSchema("Member id"),
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
      .max(100, "Share link token cannot exceed 100 characters"),
    role: z.enum(["editor", "viewer", "commenter"], {
      errorMap: () => ({
        message: "Role must be editor, viewer, or commenter",
      }),
    }),
  }),
});

export const invitedUsersSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id"),
      userId: idSchema("User id"),
    })
    .strict(),
});

export const transferOwnershipSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id"),
      newOwnerId: idSchema("New owner id"),
    })
    .strict(),
});

export const updateCodeRoomSchema = z.object({
  body: z
    .object({
      roomId: idSchema("Room id"),
    })
    .strict(),
});

export const updateLinkShareRoomSchema = z.object({
  params: z.object({ roomId: idSchema("Room id") }),
  body: z.object({
    role: z.enum(["viewer", "editor", "commenter"], {
      errorMap: () => ({
        message: "Role must be editor, viewer, or commenter",
      }),
    }),
    access: z.enum(["anyone", "invited"], {
      errorMap: () => ({ message: "Access must be anyone, invited" }),
    }),
  }),
});
