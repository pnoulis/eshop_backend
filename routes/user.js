import express from "express";
const Router = express.Router();
import User from "#user";
import {Products} from "#products";

Router.use(User);
Router.post("/api/cart-add", (req, res, next) => res.locals.user.cart.add(req, res, next));
Router.delete("/api/cart-remove", (req, res, next) => res.locals.user.remove(req, res, next));

Router.get("/api/products/:tags", (req, res, next) => Products.getByTag(req, res, next));

export default Router;
