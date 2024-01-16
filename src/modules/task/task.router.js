import { Router } from 'express'
import { getAll, getTasksOfOneUser, getLateTasks, addTask, updateTask, deleteTask } from './controller/task.controller.js'
import asyncHandler from '../../utils/asyncHandler.js'
import {userAuth} from '../../middleWare/auth.js'

const router = Router()

router.get('/',asyncHandler(getAll))

router.get("/oneUserTask", userAuth, asyncHandler(getTasksOfOneUser));

router.get("/lateTasks", asyncHandler(getLateTasks));

router.post("/addTask", userAuth, asyncHandler(addTask));

router.patch("/update/:id", userAuth, asyncHandler(updateTask));

router.delete("/delete/:id", userAuth, asyncHandler(deleteTask));

export default router;