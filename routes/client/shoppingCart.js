import express from "express";
import {CART_HANDLERS} from "#handlers";

const Router = express.Router();

Router.post(
  "/api/cart-add",
  CART_HANDLERS.requestStock,
  CART_HANDLERS.addToCart,
);

Router.delete(
  "/api/cart-remove",
  CART_HANDLERS.remove,
);

Router.delete(
  "/api/cart-delete",
  CART_HANDLERS.delete,
);

Router.post(
  "/api/cart",
  CART_HANDLERS.review,
);
export default Router;
