import * as testing from "./testing.js";
export * from "./validateInput.js";
export * from "./testing.js";
export * from "./errors.js";

const Middleware = [
  ...Object.values(testing),
];

export default Middleware;
