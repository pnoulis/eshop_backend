import express from "express";
import productsRouter from "./products.js";
import tagsRouter from "./tags.js";
const Router = express.Router();

Router.use(
  tagsRouter,
  productsRouter,
);
export default Router;
