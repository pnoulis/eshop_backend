import express from "express";
import log from "#log";
const Router = express.Router();


import {validateInput} from "#middleware";
import {AUTH_HANDLERS} from "#handlers";


Router.get("/api", (req, res, next) => {
  console.log(req);
  res.json({ok: true, payload: {session: req.session, user: req.user}});
});

Router.post("/api/session/create", (req, res) => {
  req.session.live = true;
  req.session.timeOfCreation = new Date().toString();
  res.json({ok: true, payload: req.session});
});

Router.get("/api/session/show", (req, res) => {
  console.log(req.sessionID);
  res.json({ok :true, payload: {session: req.session, user: req.user}});
});

Router.get("/api/regenerate", (req, res) => {
  req.session.regenerate(err => {
    if (err) {
      res.send({ok: false, err});
    }
    res.json({ok: true, session: "regenareted"});
  });
});

export default Router;

