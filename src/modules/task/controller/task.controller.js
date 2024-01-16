import taskModel from "../../../DB/models/taskModel.js";
import userModel from '../../../DB/models/userModel.js'
//==============================
//get all with user data
//==============================
export const getAll = async (req, res, next) => {
  const tasks = await taskModel.find().populate("user", ["userName", "email"]);
  return res.status(200).json({ msg: "Success", tasks });
};
//==============================
//get tasks of one user
//==============================
export const getTasksOfOneUser = async (req, res, next) => {
  const tasks = await taskModel.find({ userId: req.user._id });
  // const user = await userModel.findById(req.user._id)
  // user.tasks=tasks
  // return res.status(200).json({ msg: "Success", user });
  return res.status(200).json({ msg: "Success", user: req.user, tasks });
};
//==============================
//get late tasks
//==============================
export const getLateTasks = async (req, res, next) => {
  const date = new Date();
  const tasks = await taskModel.find({
    deadline: {
      $lte: date,
    },
  });
  return res.status(200).json({ msg: "Success", tasks });
};
//==============================
//add
//==============================
export const addTask = async (req, res, next) => {
  const { title, description, status, assignTo, deadline } = req.body;
  const task = await taskModel.create({
    title,
    description,
    status,
    assignTo,
    userId: req.user._id,
    deadline,
  });
  return res.status(200).json({ msg: "task created", task });
};
//==============================
//update
//==============================
export const updateTask = async (req, res, next) => {
  const { title, description, status, assignTo } = req.body;
  const { id } = req.params;
  const task = await taskModel.updateOne(
    { _id: id, userId: req.user._id },
    { title, description, status, assignTo },
    { new: true }
  );
  if (!task.matchedCount) {
    return next(new Error("invalid id"));
  }
  return task.modifiedCount
    ? res.status(200).json({ msg: "Updated", task })
    : next(new Error("please enter new values"));
};
//==============================
//delete
//==============================
export const deleteTask = async (req, res, next) => {
  const { id } = req.params;
  const deletedTask = await taskModel.findByIdAndDelete({ _id: id });
  return deletedTask
    ? res.status(200).json({ msg: "task deleted" })
    : next(new Error("invalid id"));
};
