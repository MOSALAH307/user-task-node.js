import { Router } from "express";
import {
  changePass,
  confirmEmail,
  deleteUser,
  forgetPassword,
  logout,
  refreshToken,
  resetPassword,
  signin,
  signup,
  softDelete,
  unsubscribe,
  updateUser,
} from "./controller/user.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { userAuth } from "../../middleWare/auth.js";

const router = Router();

//===============================
//user end points
//===============================
router.post("/signup", asyncHandler(signup));

router.post("/login", asyncHandler(signin));

router.patch("/changePassword", userAuth, asyncHandler(changePass));

router.patch("/updateUser", userAuth, asyncHandler(updateUser));

router.delete("/deleteUser", userAuth, asyncHandler(deleteUser));

router.patch("/softDelete", userAuth, asyncHandler(softDelete));

router.get("/logout", userAuth, asyncHandler(logout));

router.get("/confirmEmail/:token", asyncHandler(confirmEmail));

router.get("/refreshToken/:token", asyncHandler(refreshToken));

router.get("/forgetPassword", asyncHandler(forgetPassword));

router.get("/resetPassword/:token", asyncHandler(resetPassword));

router.delete(
  "/unsubscribe/:token",
  asyncHandler(unsubscribe),
  asyncHandler(deleteUser)
);

export default router;
