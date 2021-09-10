import express from "express";
import log from "#log";
import Session from "#session";
import {validateInput} from "#middleware";
import {AUTH_HANDLERS, CART_HANDLERS} from "#handlers";
import USER_HANDLER from "#lib/events.js";

const Router = express.Router();



Router.get(
  "/api/various",
  USER_HANDLER.addToCart,
  (req, res, next) => {
    console.log(USER_HANDLER);
    next();
  },
  (req, res, next) => {
    res.json({ok: true});
  },
);












































// Router.get("/api", (req, res, next) => {
//   console.log(req);
//   res.json({ok: true, payload: {session: req.session, user: req.user}});
// });

// Router.get("/newUser", (req, res, next) => {

// });

// Router.post(
//   "/api/session/create",
//   (req, res, next) => {
//     req.session.live = true;
//     req.session.toc = new Date();
//     res.json({ok: true, payload: {session: req.session, sid: req.sessionID}});
//   },
// );

// Router.get(
//   "/api/session/touch",
//   (req, res, next) => {
//     req.session.touch();
//     res.json({ok: true, payload: {session: req.session, sid: req.sessionID}});
//   }
// );
// Router.get("/api/session/show", (req, res) => {
//   console.log(req.session);
//   res.json({ok :true, payload: {session: req.session, sid: req.sessionID, passport: req.user}});
// });

// Router.get(
//   "/api/session/add",
//   (req, res, next) => {
//     req.session.pavlos = Math.random(100 * 100) + 1;
//     res.json({ok: true, payload: {session: req.session, sid: req.sessionID}});
//   }
// )

// Router.get("/api/regenerate", (req, res) => {
//   req.session.regenerate(err => {
//     if (err) {
//       res.send({ok: false, err});
//     }
//     res.json({ok: true, payload: {session: req.session, sid: req.sessionID, passport: req.user}});
//   });
// });

// Router.get("/api/sessions", (req, res) => {

// });
// Router.get("/api/stock/:pid", (req, res) => {
//   console.log(`get stock: ${req.params.pid}`);
//   Stock.get(req.params.pid, (err, stock) => {
//     if (err) return res.json({ok: false});
//     res.json({ok: true, payload: stock});
//   });
// });

// Router.get("/api/stock-available/:pid", (req, res) => {
//   console.log(`get stock availability ${req.params.pid}`);
//   Stock.isStockAvailable(req.params.pid, (err, is) => {

//   });
// });

export default Router;

