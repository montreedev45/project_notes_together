import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // 1. req.body ปลอดภัยสำหรับการ Re-assign
    if (parsed.body) req.body = parsed.body;

    // 2. req.query แก้ด้วยการคัดลอก Properties เข้าไปใน Object เดิม
    if (parsed.query) {
      // ลบ Query Parameters เดิมออกเพื่อล้างค่าขยะ
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      // ใส่ค่าที่ผ่านการ Validate/Trim จาก Zod เข้าไปแทนที่
      Object.assign(req.query, parsed.query);
    }

    // 3. req.params แก้ด้วยการใช้ Object.assign เช่นเดียวกัน
    if (parsed.params) {
      Object.assign(req.params, parsed.params);
    }

    return next();
  } catch (error) {
    const issues = error?.errors || error?.issues;

    if (error instanceof ZodError || Array.isArray(issues)) {
      // ตรงนี้ต้องส่งแค่ JSON Error ออกไป ห้ามมี res.cookie() เด็ดขาด
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: (issues || []).map((err) => ({
          field: err.path ? err.path.join(".") : "unknown",
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
