import pino from "pino";
import {formatErr} from "./error.js";
const
formatLog = (log) => {
  if (log.err) {
    log.error = formatErr(log.err);
    delete log.err;
  }
  return log;
},
infoTransport = pino.transport({
  level: "info",
  target: "#pino/file",
  options: {destination: 1}
  // options: {destination: "/var/log/backendserver/info.log"}
}),
errorTransport = pino.transport({
  level: "error",
  target: "#pino/file",
  options: {destination: 1},
  // options: {destination: "/var/log/backendserver/error.log"}
}),
warnTransport = pino.transport({
  level: "warn",
  target: "#pino/file",
  options: {destination: 1},
  // options: {destination: "/var/log/backendserver/warn.log"}
}),
INFO = pino().info.bind(pino(infoTransport)),
ERROR = pino().error.bind(pino(errorTransport)),
WARN = pino().error.bind(pino(warnTransport)),
info = (log) => INFO(formatLog(log)),
error = (log) => ERROR(formatLog(log)),
warn = (log) => WARN(formatLog(log));

export default {info, error, warn};
