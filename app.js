import userRouter from "./src/modules/user/user.router.js";
import taskRouter from "./src/modules/task/task.router.js";
import connection from "./src/DB/connection.js";
import globalError from "./src/utils/glabalError.js";

const initiateApp = (app, express) => {
  connection();
  app.use(express.json());
  app.use("/user", userRouter);
  app.use("/task", taskRouter);
  app.use("*", (req, res) => {
    return res.json({ msg: "catch error in routing" });
  });
  app.use(globalError);
};

export default initiateApp;
