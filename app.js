import express from "express";
import body_parser from "body-parser";
import config from "./config/config.js";
import express_session from "express-session";
import cors from "cors";
import {handleError} from "#handlers";
import routes from "#routes";
import middleware from "#middleware";
import startDatabases from "#misc/start.js";

const app = express();

app.use(
  cors(),
  // express_session(config.session),
  body_parser.json(),
  body_parser.text(),
  body_parser.urlencoded({extended: true}),
  ...middleware,
  routes,
  handleError,
);

const
initMessage = `Express started in ${config.env} mode` +
  ` at ${config.serverDomain}; press Ctrl-C to terminate`,
server = app.listen(config.port, () => console.log(initMessage));
