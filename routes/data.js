import express from "express";
import config from "#config";
const Router = express.Router();

const
branch = {
  street: "leoforos oxi 12",
  city: "bristol",
  region: "south gloucesteshire",
  postcode: "bs5 6se",
  country: "uk",
  phones: [2310248298, 2310775228],
},
emails = {
  sales: "sales@info.com",
  support: "support@support.com",
  info: "info@info.com",
},
phones = [
  2310248298, 2310775228
],
logos = [
  config.imgDir + "/logo/google_logo.png",
],
socials = {
  // link to pages
  facebook: {
    page: "https://www.facebook.com/myPage",
    auth: {
      clientID: "some creds",
      clientSecret: "some creds",
    },
  },
  google: {
    page: "https://www.google.com/myPage",
    auth: {
      clientID: "some credentials",
      clientSecret: "some more creds",
    }
  },
  instagram: {
    page: "https://www.instagram.com/myPage",
    auth: {
      clientID: "some credentials",
      clientSecret: "some more creds",
    }
  },
};
Router.get(
  "/api/data/:set",
  (req, res, next) => {
    console.log(req.params);
    switch (req.params.set) {
    case "emails":
      return res.json({ok: true, payload: emails });
    case "phones":
      return res.json({ok: true, payload: phones });
    case "HQ":
      return res.json({ok: true, payload: {HQ: "HQ"} });
    case "branch":
      return res.json({ok: true, payload: branch });
    case "socials":
      Object.entries(socials).forEach(( [k, v] ) => {
        if (v.auth.clientID && v.auth.clientSecret) v.auth = true;
      });
      return res.json({ok: true, payload: socials });
    case "logos":
      console.log("will get logos");
      console.log(logos);
      return res.json({ok: true, payload: logos });
    default:
      return res.json({ok: false});
    }
  },
);

export default Router;
