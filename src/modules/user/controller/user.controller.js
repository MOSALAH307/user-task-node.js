import userModel from "../../../DB/models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import sendEmail from "../../../utils/sendEmail.js";
import tokenModel from "../../../DB/models/tokenModel.js";
import {
  changePassSchema,
  signupSchema,
  updateUserSchema,
  loginSchema,
} from "../validation/user.validation.js";
//==============================
//singup
//==============================
export const signup = async (req, res, next) => {
  const { userName, email, password, age, gender, phone } = req.body;
  //validate req.body
  const isValid = signupSchema.validate(
    { userName, email, password, age, gender, phone },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const isFound = await userModel.findOne({ email });
  //check if email exists in database
  if (isFound) {
    return next(new Error("email already exists"));
  }
  //hashing password
  const hash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  const newUser = await userModel.create({
    userName,
    email,
    password: hash,
    age,
    gender,
    phone,
  });
  //token for confirm email
  const token = jwt.sign(
    {
      email,
      _id: newUser._id,
    },
    process.env.SIGNATURE,
    {
      expiresIn: 60 * 5,
    }
  );
  //refresh token
  const refreshToken = jwt.sign(
    {
      email,
      _id: newUser._id,
    },
    process.env.SIGNATURE,
    {
      expiresIn: 60 * 60 * 24 * 7,
    }
  );
  //confirm email link
  const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;
  const refreshLink = `${req.protocol}://${req.headers.host}/user/refreshToken/${refreshToken}`;
  //send email for confirmation
  const isSent = await sendEmail({
    to: email,
    subject: "confirm email",
    text: "Confirm your email to complete your sign-up",
    html: `<a href='${link}'>
    This is valid for only 5 mins since the time it was sent at, please click to confirm your email
    </a>
    <br>
    <br>
    <br>
    <a href='${refreshLink}'>
    This is valid for 7days, please click to refresh your request
    </a>`,
  });
  return isSent?.messageId
    ? res.status(201).json({ msg: "user added successfully" })
    : next(new Error("error sending email"));
};
//==============================
//confirm email
//==============================
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.SIGNATURE);
  const user = await userModel.updateOne(
    { _id: payload._id },
    { confirmEmail: true }
  );
  return res.redirect("http://localhost:3000/user/login");
};
//==============================
//refresh token
//==============================
export const refreshToken = async (req, res, next) => {
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.SIGNATURE);
  const newToken = jwt.sign(
    { _id: payload._id, email: payload.email },
    process.env.SIGNATURE,
    { expiresIn: 60 * 3 }
  );
  const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;
  sendEmail({
    to: payload.email,
    subject: "confirm email",
    text: "Confirm your email to complete your sign-up",
    html: `<a href='${link}'>
    This is valid for only 3 mins since the time it was sent at, please click to confirm your email
    </a>`,
  });
  return res.status(200).json({ msg: "check your email" });
};
//==============================
//sign in
//==============================
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  const isValid = loginSchema.validate(
    { email, password },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("wrong credentials"));
  }
  if (!user.confirmEmail) {
    return next(new Error("please check your email to confirm email first"));
  }
  const matchPass = bcrypt.compareSync(password, user.password);
  if (!matchPass) {
    return next(new Error("wrong credentials"));
  }
  const token = jwt.sign(
    {
      _id: user._id,
      email,
      userName: user.userName,
      confirmEmail: user.confirmEmail,
    },
    process.env.SIGNATURE
  );
  return res.status(200).json({ msg: "success", token });
};
//==============================
//change password
//==============================
export const changePass = async (req, res, next) => {
  const { password } = req.body;
  const isValid = changePassSchema.validate(
    { password },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const user = await userModel.findById(req.user._id);
  //check if entered password is same as the old one or not
  const samePass = bcrypt.compareSync(password, user.password);
  if (samePass) {
    return next(
      new Error("This is the same password, please enter a new password")
    );
  }
  const newHash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  const updatedUser = await userModel.updateOne(
    { _id: req.user._id },
    { password: newHash }
  );
  return res.status(200).json({ msg: "password changed successfully" });
};
//==============================
//update user
//==============================
export const updateUser = async (req, res, next) => {
  const { userName, age } = req.body;
  const isValid = updateUserSchema.validate(
    { userName, age },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const updatedUser = await userModel.updateOne(
    { _id: req.user._id },
    { userName, age }
  );
  if (!updatedUser.matchedCount) {
    return next(new Error("user not valid"));
  }
  return updatedUser.modifiedCount
    ? res.status(200).json({ msg: "user updated successfully" })
    : res.status(404).json({ msg: "please enter new values" });
};
//==============================
//delete user
//==============================
export const deleteUser = async (req, res, next) => {
  const deletedUser = await userModel.findByIdAndDelete(req.user._id);
  //to expire token
  await tokenModel.create({ token: req.token });
  return res.status(200).json({ msg: "user deleted" });
};
//==============================
//soft delete
//==============================
export const softDelete = async (req, res, next) => {
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { isDeleted: true }
  );
  //to expire token
  await tokenModel.create({ token: req.token });
  return user.modifiedCount
    ? res.status(200).json({ msg: "user deleted status updated successfully" })
    : res.status(404).json({ msg: "user already soft deleted" });
};
//==============================
//log out
//==============================
export const logout = async (req, res, next) => {
  //to expire token
  await tokenModel.create({ token: req.token });
  return res.status(200).json({ msg: "logged out" });
};
//==============================
//forget password
//==============================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const isFound = await userModel.findOne({ email });
  if (!isFound) {
    return next(new Error("invalid email"));
  }
  const token = jwt.sign(
    {
      email,
      _id: isFound._id,
    },
    process.env.SIGNATURE
  );
  const link = `${req.protocol}://${req.headers.host}/user/resetPassword/${token}`;
  const unsubscribeLink = `${req.protocol}://${req.headers.host}/user/unsubscribe/${token}`;

  const isSent = await sendEmail({
    to: email,
    subject: "reset password",
    text: "Please click the following link to reset your password",
    html: `<a href='${link}'>click to reset password</a>
    <div><p>If you want to unsubscribe from the service or it's wrong email registered please click the following link</p>
    <br>
    <a href=${unsubscribeLink}>click to unsubscribe</a>
    </div>
    `,
  });
  return isSent?.messageId
    ? res.status(200).json({
        msg: "Reset email has been sent to you,please check your email",
      })
    : next(new Error("error sending email"));
};
//reset password
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.SIGNATURE);
  if (!payload?._id) {
    return next(new Error("invalid payload"));
  }
  const isFound = await userModel.findById(payload._id);
  if (!isFound) {
    return next(new Error("invalid id"));
  }
  // from here user will be redirected to change password page and change password
  return res
    .status(200)
    .json({ msg: "Confirmed and redirected to change password" });
};
//==============================
//unsubscribe
//==============================
export const unsubscribe = async (req, res, next) => {
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.SIGNATURE);
  req.token = token;
  req.user = payload;
  return next();
};
