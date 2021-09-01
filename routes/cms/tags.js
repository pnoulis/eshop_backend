import express from "express";
import {TAG_HANDLERS} from "#handlers";
const Router = express.Router();

// read tags
Router.get(
  "/api/tags",
  TAG_HANDLERS.read
);

export default Router;
