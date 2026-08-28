import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// 1. Import ฟังก์ชันลงทะเบียนจากแต่ละโมดูล
import { setupAuthSwagger } from "../server/modules/auth/auth.swagger.js";
import { setupCommentSwagger } from "../server/modules/comment/comment.swagger.js";
import { setupUploadSwagger } from "../server/modules/note/upload.swagger.js";
import { setupNotificationSwagger } from "../server/modules/notification/notification.swagger.js";
import { setupPlanSwagger } from "./modules/plan/plan.swagger.js";
import { setupUserSwagger } from "./modules/user/user.swagger.js";
import { setupRoomSwagger } from "./modules/room/room.swagger.js";
// import { setupRoomSwagger } from "../modules/room/room.swagger.js"; 

extendZodWithOpenApi(z);

// 2. สร้าง Registry ขึ้นมาให้เสร็จสมบูรณ์ก่อน
export const registry = new OpenAPIRegistry();

// 3. ส่ง registry เข้าไปให้แต่ละโมดูลจัดการตัวเอง
setupAuthSwagger(registry);
setupCommentSwagger(registry);
setupUploadSwagger(registry)
setupNotificationSwagger(registry)
setupPlanSwagger(registry)
setupUserSwagger(registry)
setupRoomSwagger(registry)

export const generateOpenApiDocs = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
  });
};