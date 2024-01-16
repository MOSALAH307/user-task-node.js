import jwt from "jsonwebtoken";
import userModel from "../DB/models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import tokenModel from '../DB/models/tokenModel.js';

export const userAuth = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new Error("please login"));
  }
  const token = authorization.split(`${process.env.AUTH_KEYWORD} `)[1];
  if (!token) {
    return next(new Error("invalid token key"));
  }
  //check if token is expired or not
  const isFound = await tokenModel.findOne({ token });
  if (isFound) {
    return next(new Error("Not authorized please login") );
  }
  const payload = jwt.verify(token, process.env.SIGNATURE);
  if (!payload?._id) {
    return next(new Error("invalid payload"));
  }
  const user = await userModel.findById(payload._id).select("email");
  if (!user) {
    return next(new Error("invalid id"));
  }
  req.token = token;
  req.user = user;
  return next();
});
