import {SESSION_TIMEOUT} from "#session";
import credentials from "./.credentials.dev.js";

const
env = process.env.NODE_ENV || "development",
port = process.env.PORT || 4006,
serverDomain = `http://localhost:${port}`,
clientDomain = "http://localhost:3000",
productsImgDir = "/public/products/",
publicDir = "/public",
serverRoot = "nnbackend",
cors = {
  // Access-Control-Allow-Origin
  origin: `${clientDomain}`,
  // Access-Control-Allow-Credentials
  credentials: true,
},

session = {
  resave: false,
  rolling: false,
  // express-session creates a session for each request-response cycle. If the server populates the session
  // before servicing the request, then the session  will be saved to the store. the _saveUninitialized_
  // option if set to true will save the session to the store even if its not populated.
  saveUninitialized: false,
  secret: credentials.secretKey,
  secure: true,
  cookie: {
    maxAge: SESSION_TIMEOUT,
    secure: false,
    sameSite: "lax", // "none" || "lax" || "strict"
    httpOnly: true,
    path: "/api",
  }
};

export default {
  env,
  port,
  session,
  serverRoot,
  serverDomain,
  clientDomain,
  productsImgDir,
  publicDir,
  credentials,
  cors,
};
