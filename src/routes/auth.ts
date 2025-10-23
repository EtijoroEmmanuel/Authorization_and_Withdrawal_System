import express from "express";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validations/user";
import { AuthService } from "../services/authUser";
import { asyncHandler } from "../middlewares/async";

const router = express.Router();
const authService = new AuthService();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authService.register.bind(authService))
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authService.login.bind(authService))
);

export default router;
