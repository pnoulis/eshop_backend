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
},
Session = {
  timeOut: SESSION_TIMEOUT,
  express: () => express_session(SESSION_CONFIG),
  set(session, newState, action = "") {
    if (!session) throw new Error("no session in req object");

    switch (action) {
    case "addToCart":
      if (!session.state) return session.state = {
        loggedIn: false,
        timeOut: new Date(Date.now()),
        level: "guest",
        cart: {[newState.pid]: newState.stocks}
      };

      session.state.cart.hasOwnProperty(newState.pid) ?
        session.state.cart[newState.pid].push(...newState.stocks) :
        session.state.cart[newState.pid] = newState.stocks;
      break;
    default:
      return session.state ? session.state = {
        ...session.state,
        ...newState,
      } : session.state = {
        loggedIn: false,
        timeOut: new Date(Date.now()),
        level: "guest",
        ...newState,
      };
    }
  },
  login(session, user, cb) {
    if (!session) return process.nextTick(() => cb(new Error("no session in req object")));

    if (!session.state) {
      session.state = {
        loggedIn: true,
        timeOut: SESSION_TIMEOUT,
        ...user,
      };
      return process.nextTick(() => cb(null, true));
    }

    if (session.state.level === "guest") {
      session.state = {
        ...session.state,
        ...user,
      };
      session.touch();
      return process.nextTick(() => cb(null, true));
    }

    session.regenerate(err => {
      if (err) return process.nextTick(() => cb(err));
      session.state = {
        loggedIn: true,
        timeOut: SESSION_TIMEOUT,
        ...user,
      };
      return process.nextTick(() => cb(null, true));
    });
  },

  logout() {},
};

export default Session;
