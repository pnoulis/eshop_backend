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
  origin: [clientDomain, "http://localhost:3002", "http://localhost:3003"],
  // origin: `${clientDomain}`,
  // Access-Control-Allow-Credentials
  credentials: true,
};

export default {
  env,
  port,
  serverRoot,
  serverDomain,
  clientDomain,
  productsImgDir,
  publicDir,
  credentials,
  cors,
};
