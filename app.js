import express from "express";
import {createRequire} from "module";
import {fileURLToPath} from "url";
import {dirname} from "path";
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import body_parser from "body-parser";
import config from "./config/config.js";
import express_session from "express-session";
import cors from "cors";
import routes from "#routes";
import middleware, {handleError} from "#middleware";
import startDatabases from "#misc/start.js";
import passport from "#lib/auth/passport.js";

const app = express();

app.use(
  express.static(__dirname + "/public"),
  cors(config.cors),
  express_session(config.session),
  passport.initialize(),
  passport.session(),
  body_parser.json(),
  body_parser.text(),
  body_parser.urlencoded({extended: true}),
  ...middleware,
  routes,
  handleError
);


const
initMessage = `Express started in ${config.env} mode` +
  ` at ${config.serverDomain}; press Ctrl-C to terminate`,
server = app.listen(config.port, () => console.log(initMessage));
