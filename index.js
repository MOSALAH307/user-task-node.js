import express from "express";
import { config } from "dotenv";
import initiateApp from "./app.js";

config();
const app = express();

initiateApp(app, express);

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);
