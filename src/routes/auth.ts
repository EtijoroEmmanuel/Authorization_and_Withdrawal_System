import express from "express";
import { registerUser, loginUser } from "../controllers/auth";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validations/user";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;
