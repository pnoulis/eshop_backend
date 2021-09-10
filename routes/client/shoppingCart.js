import express from "express";
import {Stock, Index} from "#stock-management";
import {CART_HANDLERS} from "#handlers";

const Router = express.Router();

Router.post(
  "/api/cart-add",
  (req, res, next) => {
    const stock = {
      pid: req.body.pid,
      rstock: 9,
      vstock: 9,
    };
    Stock.lease(req.sessionID, req.body.pid, req.body.amount, (err, set) => {
      console.log("callback is back");
      if (err) {
        console.log(err);
        return res.json({ok: false});
      }

      return res.json({ok: true, payload: set});
    });
  }
  // CART_HANDLERS.requestStock,
  // CART_HANDLERS.addToCart,
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
