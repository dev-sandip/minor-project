import { Router } from "express";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth";

export const userRouter = Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.get("/profile", authMiddleware, userController.profile);