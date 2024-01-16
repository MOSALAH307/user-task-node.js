import { Schema, model } from "mongoose";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const tokenModel = model("Token", tokenSchema);

export default tokenModel;
