import { Router } from "express";
import { getUserInfo } from "../controllers/user";
import { userAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/info", userAuth, getUserInfo);

export default router;
