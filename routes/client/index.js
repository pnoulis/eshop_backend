import express from "express";
const Router = express.Router();
import shopCartRouter from "./shoppingCart.js";
import productsRouter from "./products.js";

Router.use(
  shopCartRouter,
  productsRouter,
);

export default Router;
