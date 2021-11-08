import express from "express";
import {Mongoose} from "#databases";
const Router = express.Router();
import User from "#user";
import {Products} from "#products";

Router.use(User);

Router.get(
  "/api/cart", // get cart
  (req, res, next) => res.locals.user.cart.get(req, res, next)
);
Router.post( // add cart item
  "/api/cart/add",
  (req, res, next) => res.locals.user.cart.add(req, res, next)
);
Router.delete(
  "/api/cart/remove", // remove cart item
  (req, res, next) => res.locals.user.cart.remove(req, res, next)
);
Router.get(
  "/api/products/:tags/:page", // get products
  (req, res, next) => Products.getByTag(req, res, next)
);
Router.post( // login
  "/api/login",
  (req, res, next) => res.locals.user.login(req, res, next)
);

Router.delete( // logout
  "/api/logout",
  (req, res, next ) => res.locals.user.logout(req, res, next)
);
Router.post( // register
  "/api/register",
  (req, res, next) => res.locals.user.register(req, res, next)
);
Router.get( // get session
  "/api/session",
  (req, res, next) => res.locals.user.get(req, res, next)
);

export default Router;
