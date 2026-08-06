import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

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
