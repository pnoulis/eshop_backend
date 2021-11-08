import credentials from "./.credentials.dev.js";

const
env = process.env.NODE_ENV || "development",
backendPort = process.env.BACKEND_PORT || 8080,
adminPort = process.env.ADMIN_PORT || 8081,
frontendPort = process.env.FRONTEND_PORT || 8082,
serverDomain = `http://${process.env.DOMAIN || "localhost"}:${backendPort}`,
clientDomain = `http://${process.env.DOMAIN || "localhost"}:${frontendPort}`,
adminDomain = `http://${process.env.DOMAIN || "localhost"}:${adminPort}`,
productsImgDir = "/public/products/",
imgDir = serverDomain,
publicDir = "/public",
serverRoot = "nnbackend",
cors = {
  // Access-Control-Allow-Origin
  origin: [clientDomain, adminDomain, serverDomain],
  // origin: `${clientDomain}`,
  // Access-Control-Allow-Credentials
  credentials: true,
};

export default {
  env,
  port: backendPort,
  serverRoot,
  serverDomain,
  clientDomain,
  imgDir,
  productsImgDir,
  publicDir,
  credentials,
  cors,
};
