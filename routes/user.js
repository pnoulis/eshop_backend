import express from "express";
const Router = express.Router();
import User from "#user";

Router.use(User);
Router.post("/api/cart-add", (req, res, next) => res.locals.user.cart.add(req, res, next));
Router.delete("/api/cart-remove", (req, res, next) => res.locals.user.remove(req, res, next));

export default Router;
