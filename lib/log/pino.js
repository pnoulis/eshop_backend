import pino from "pino";
const
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
info = pino().info.bind(pino(infoTransport)),
error = pino().error.bind(pino(errorTransport)),
warn = pino().warn.bind(pino(warnTransport));

export default {info, error, warn};
