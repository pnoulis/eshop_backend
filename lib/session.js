import {expireIn} from "#misc/time.js";
import {redisClient} from "#databases";
import redis_session from "connect-redis";
import express_session from "express-session";
import config from "#config";

const
SESSION_TIMEOUT = expireIn({expireIn: "30s"}),
SESSION_COOKIE = {
  maxAge: SESSION_TIMEOUT,
  secure: false,
  sameSite: "lax", // "none" || "lax" || "strict"
  httpOnly: true,
  path: "/api",
},
REDIS_STORE = redis_session(express_session),
SESSION_CONFIG = {
  store: new REDIS_STORE({client: redisClient}),
  resave: false,
  rolling: false,
  // express-session creates a session for each request-response cycle. If the server populates the session
  // before servicing the request, then the session  will be saved to the store. the _saveUninitialized_
  // option if set to true will save the session to the store even if its not populated.
  saveUninitialized: false,
  secret: config.credentials.secretKey,
  secure: true,
  cookie: SESSION_COOKIE,
};

const Session = {};
Session.timeout = SESSION_TIMEOUT;
Session.express = () => express_session(SESSION_CONFIG);
Session.init = function(session) {
  this.__session = session;
  this.__state = this.__session.state || {
    loggedIn: false,
    level: "guest",
    cart: {meta: {}},
  };
};
Session.set = function(prop, newState) {
  if (!this.__session.state) {
    this.__session.state = this.__state;
  }
};
Session.get = function(prop) {
  return prop ? this.__state[prop] : this.__state;
};


export default Session;
