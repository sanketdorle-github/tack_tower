import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  searchUsers,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/logout").post(logoutUser);
router.route("/search").get(searchUsers)

// router.route("/profile").post(getUserProfile);

export default router;
