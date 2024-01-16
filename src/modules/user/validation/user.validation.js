import joi from "joi";

export const signupSchema = joi
  .object({
    userName: joi.string().min(3).max(20).alphanum().required(),
    email: joi.string().email().required(),
    password: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{8,20}$"))
      .required(),
    age: joi.number(),
    gender: joi.string().valid("male", "female"),
    phone: joi.number(),
  })
  .required();

export const loginSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{8,20}$"))
      .required(),
  })
  .required();

export const changePassSchema = joi
  .object({
    password: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{8,20}$"))
      .required(),
  })
  .required();

export const updateUserSchema = joi
  .object({
    username: joi.string().min(3).max(20).alphanum().required(),
    age: joi.number(),
  })
  .required();
