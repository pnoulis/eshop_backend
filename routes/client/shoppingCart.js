import express from "express";
import {CART_HANDLERS} from "#handlers";

const Router = express.Router();


Router.post(
  "/api/cart-add",
  CART_HANDLERS.decodeCart,
  CART_HANDLERS.add,
  CART_HANDLERS.encodeCart,
);

Router.delete(
  "/api/cart-remove",
  CART_HANDLERS.decodeCart,
  CART_HANDLERS.remove,
  CART_HANDLERS.encodeCart,
);

Router.delete(
  "/api/cart-delete",
  CART_HANDLERS.decodeCart,
  CART_HANDLERS.delete,
  CART_HANDLERS.encodeCart,
);

Router.post(
  "/api/cart",
  CART_HANDLERS.decodeCart,
  CART_HANDLERS.review,
);
export default Router;
