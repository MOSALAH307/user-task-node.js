import { model, Schema } from "mongoose";

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: Number,
  phone: Number,
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  confirmEmail: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const userModel = model("user", userSchema);

export default userModel;
