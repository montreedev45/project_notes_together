import express from "express";
import { register, login } from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authMiddleware, (req, res)=>{
    res.status(200).json({
        message: "Authenticated",
        user: req.user
    })
})


export default router;