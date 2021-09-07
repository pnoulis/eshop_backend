import express from "express";
import {CLIENT_PRODUCT_HANDLERS} from "#handlers";
const Router = express.Router();

Router.get(
  "/api/products/:tag",
  CLIENT_PRODUCT_HANDLERS.read,
);

export default Router;
