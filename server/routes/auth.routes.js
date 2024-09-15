import { Router } from "express";
import {
  getUserDetails,
  login,
  register,
} from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/user/me").get(protect, getUserDetails);

export default authRouter;
