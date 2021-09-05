import express from "express";
const Router = express.Router();
import shopCartRouter from "./shoppingCart.js";

Router.use(
  shopCartRouter,
);

export default Router;
