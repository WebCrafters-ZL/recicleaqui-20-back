import { Router } from "express";
import apiLimiter from "../middlewares/rateLimiter.js";
import { login } from "../controllers/auth/index.js";

const router = Router();

router.post("/login", apiLimiter, login);

export default router;
