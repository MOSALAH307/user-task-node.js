import { model, Schema, Types } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["toDo", "doing", "done"],
      default: "toDo",
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    assignTo: {
      type: Types.ObjectId,
      ref: "user",
    },
    deadline: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

//virtual to rename userId as user when using populate
taskSchema.virtual("user", {
  ref: "user",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

const taskModel = model("task", taskSchema);

export default taskModel;
