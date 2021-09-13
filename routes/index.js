import express from "express";
import cmsRouter from "./cms/index.js";
import testingRouter from "./testing.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";
const Router = express.Router();

Router.use(
  userRouter,
  cmsRouter,
  authRouter,
  testingRouter
);

export default Router;
