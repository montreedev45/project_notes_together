import z from "zod";

export const getCommentSchema = z.object({
  query: z
    .object({
      roomId: z
        .string({ required_error: "Room id is required" })
        .trim()
        .min(5, "Room id must be at least 5 characters")
        .max(50, "Room id is too long")
        .openapi({example: "6a5e20ee4c374cae7d7d6258"}),
    })
    .strict(),
});

export const addCommentSchema = z.object({
  body: z
    .object({
      roomId: z
        .string({ required_error: "Room id is required" })
        .trim()
        .min(5, "Room id must be at least 5 characters")
        .max(50, "Room id is too long")
        .openapi({example: "6a5e20ee4c374cae7d7d1441"}),

      type: z.enum(["text", "sticker"], {
        errorMap: () => ({ message: "Type must be 'text' or 'sticker'" }),
      })
      .openapi({example: "text"}),

      content: z.string().trim().max(1000, "Content is too long").openapi({example:"text"}).optional(),
    })
    .strict()
    .refine(
      (data) => {
        // หาก type เป็น text ต้องระบุ content มาด้วย (ห้ามเป็นค่าว่าง)
        if (data.type === "text") {
          return !!data.content && data.content.trim().length > 0;
        }
        return true;
      },
      {
        message: "Content is required when type is text",
        path: ["content"], // ชี้ตำแหน่ง Error ไปที่ field content
      },
    ),
});

export const getStickerSchema = z.object({
  query: z
    .object({
      nameImg: z
        .string({ required_error: "Name img is required" })
        .trim()
        .min(1, "Name img must be at least 1 character")
        .max(20, "Name img is too long")
        .openapi({example: "cat01.png"}),
    })
    .strict(),
});
