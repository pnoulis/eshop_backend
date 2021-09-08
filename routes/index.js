import express from "express";
import clientRouter from "./client/index.js";
import cmsRouter from "./cms/index.js";
import testingRouter from "./testing.js";
import authRouter from "./auth.js";
const Router = express.Router();

Router.use(
  clientRouter,
  cmsRouter,
  authRouter,
  testingRouter
);

export default Router;
