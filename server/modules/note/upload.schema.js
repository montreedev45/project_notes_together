import { z } from "zod";

const imageFileSchema = z
  .custom((file) => !!file, { message: "Image file is required" }) // เช็กว่ามี file ส่งมาหรือไม่
  .refine((file) => file && file.size <= 5 * 1024 * 1024, {
    message: "File size must be less than 5MB",
  })
  .refine(
    (file) =>
      file &&
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.mimetype,
      ),
    { message: "Only .jpg, .png, .webp and .gif formats are supported" },
  );

export const uploadNoteImageSchema = z.object({
  file: imageFileSchema,
  body: z
    .object({
      roomId: z
        .string()
        .trim()
        .min(1, "Room ID is required")
        .openapi({ example: "6a5e20ee4c..." }),
      description: z
        .string()
        .trim()
        .max(200)
        .optional()
        .openapi({ example: "Ex. description" }),
    })
    .optional(),
});
