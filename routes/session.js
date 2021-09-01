import express from "express";
import log from "#log";
const Router = express.Router();

import {SESSION_HANDLERS} from "#handlers";


Router.get("/api/session", (req, res, next) => res.json({ok: true, payload: req.session.state || null}));

export default Router;
