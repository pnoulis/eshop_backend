import express from "express";
import clientRouter from "./client/index.js";
import cmsRouter from "./cms/index.js";
import testingRouter from "./testing.js";
const Router = express.Router();

Router.get("/", (req, res) => {
  res.send("hello");
});
Router.use(clientRouter, cmsRouter, testingRouter);

export default Router;
