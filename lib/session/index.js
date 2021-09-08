import {expireIn} from "#misc/time.js";
import {redisClient} from "#databases";
import redis_session from "connect-redis";
import express_session from "express-session";
import config from "#config";


const
SESSION_TIMEOUT = expireIn({expireIn: "30m"}),
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
  init() {
    return {
      loggedIn: false,
      timeOut: SESSION_TIMEOUT,
      level: "guest",
    };
  },
  login(user) {
    const
    session = {
      ...user,
      loggedIn: true,
      timeOut: SESSION_TIMEOUT,
      toc: Date.now(),
    },
    client = {
      loggedIn: true,
      timeOut: SESSION_TIMEOUT,
    };

    if (session.username) client.username = session.username;
    if (session.email) client.email = session.email;
    client.toc = session.toc;

    return {session, client};
  },
  logout() {},
};

export default Session;
