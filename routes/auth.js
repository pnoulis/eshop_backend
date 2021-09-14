// import express from "express";
// import log from "#log";
// import {validateInput} from "#middleware";
// import {AUTH_HANDLERS} from "#handlers";

// const Router = express.Router();

// // register
// Router.post(
//   "/api/register",
//   validateInput,
//   AUTH_HANDLERS.register,
//   AUTH_HANDLERS.local,
//   AUTH_HANDLERS.login,
// );

// // local login
// Router.post(
//   "/api/login",
//   validateInput,
//   AUTH_HANDLERS.local,
//   AUTH_HANDLERS.login,
// );
// // facebook login
// Router.get("/login/facebook");
// Router.get("/login/facebook/callback");

// // logout
// Router.delete("/api/logout", AUTH_HANDLERS.logout);


// export default Router;
