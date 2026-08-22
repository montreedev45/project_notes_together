import { z } from "zod";

export const deleteNotificationSchema = z.object({
  params: z.object({
    noticId: z
      .string({ required_error: "Notic Id is required" })
      .trim()
      .min(1, "Notic Id must be at least 1 characters")
      .max(50, "Notic Id is too long"),
  }).strict(),
});
