import express from "express";
import {Stock} from "#stock-management";
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

Router.get("/api/stock/:pid", (req, res) => {
  console.log(`get stock: ${req.params.pid}`);
  Stock.get(req.params.pid, (err, stock) => {
    if (err) return res.json({ok: false});
    res.json({ok: true, payload: stock});
  });
});

Router.get("/api/stock-available/:pid", (req, res) => {
  console.log(`get stock availability ${req.params.pid}`);
  Stock.isStockAvailable(req.params.pid, (err, is) => {
    return err ? res.json({ok: false}) : res.json({ok: true, payload: {is}});
  });
});

Router.post("/api/take-stock/:pid", (req, res) => {
  console.log(`take stock ${req.params.pid}`);
  console.log(req.body);
  const request = {
    amount: parseInt(req.body.amount),
    pid: req.params.pid,
  };
  Stock.requestStock(request, (err, serviced, reason) => {
    if (err || !serviced) return res.json({ok: false, payload: {request, serviced, reason}});
    res.json({ok: true, payload: request});
  });
});

Router.delete("/api/return-stock/:pid", (req, res) => {
  console.log(`return stock ${req.params.pid}`);
  console.log(req.body);
  const request = { amount: parseInt(req.body.amount), pid: req.params.pid};
  Stock.returnStock(request);
  res.json({ok: true, payload: request});
});

Router.get("/api/test-timeout", (req, res) => {
  console.log("test timeout route");
  Stock.timeout((err, timeout) => {
    if (err) {
      console.log(err);
      res.json({ok: false});
    }

    return res.json({ok: true, payload: timeout});
  });
});

Router.delete("/api/delete-stock-record/:pid", (req, res) => {
  console.log("delete-stock-record route");
  console.log(req.params.pid);

  Stock.removeRedisStock(req.params.pid, (err, removed) => {
    return err ? res.json({ok: false}) : res.json({ok: true, payload: removed});
  });
});
export default Router;

