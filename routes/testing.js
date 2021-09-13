import express from "express";
import log from "#log";
import Session from "#session";
import {validateInput} from "#middleware";
import {AUTH_HANDLERS, CART_HANDLERS} from "#handlers";
import User from "#user";

const Router = express.Router();


Router.get(
  "/api/various",
  (req, res, next) => {
    Session.store.all((err, sessions) => {
      if (err) {
        console.log(err);
        return res.json({ok: false});
      }

      console.log(sessions);
      return res.json({ok: true});
    });
  }
);


export default Router;

