import express from "express";
import cmsRouter from "./cms/index.js";
import testingRouter from "./testing.js";
import dataRouter from "./data.js";
// import authRouter from "./auth.js";
import userRouter from "./user.js";
const Router = express.Router();

Router.use(
  userRouter,
  cmsRouter,
  testingRouter,
  dataRouter
);

export default Router;
