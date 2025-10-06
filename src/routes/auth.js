import { Router } from "express";
import apiLimiter from "../middlewares/rate-limiter.js";
import { login } from "../controllers/auth.js";

const router = Router();

router.post("/login", apiLimiter, login);

export default router;
