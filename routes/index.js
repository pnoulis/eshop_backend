import express from "express";
import clientRouter from "./client/index.js";
import cmsRouter from "./cms/index.js";
import testingRouter from "./testing.js";
import sessionRouter from "./session.js";
import authRouter from "./auth.js";
const Router = express.Router();

Router.use(
  clientRouter,
  cmsRouter,
  authRouter,
  sessionRouter,
  testingRouter
);

export default Router;
