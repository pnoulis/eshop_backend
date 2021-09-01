import passport from "passport";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import passportGoogle from "passport-google";
import config from "#config";
import User from "#lib/user.js";

const
localStrategy = passportLocal.Strategy,
facebookStrategy = passportFacebook.Strategy,
googleStrategy = passportGoogle.Strategy,
facebookOptions = {
  clientID: config.credentials.authProviders.facebook.appId,
  clientSecret: config.credentials.authProviders.facebook.appSecret,
  callbackURL: `${config.domain}/api/login/facebook/callback`,
  profileFields: ["id", "displayName", "email"],
},
LOCAL_STRATEGY = (email, password, done) => {
  User.getByEmail(email, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, {reason: "NoAccount"});
    return done(null, user);
    // User.comparePasswords(password, user, (err, areIdentical) => {
    //   if (err) return done(err);
    //   if (!areIdentical) return done(null, false, {reason: "Password"});
    //   return done(null, user);
    // }); // user.comparePasswords
  }); // user.getByEmail
},
FACEBOOK_STRATEGY = (accessToken, refreshToken, profile, done) => {
  const authId = "facebook:" + profile.id;
  User.getCostumerByAuthId(authId, (err, user) => {
    if (err) return done(err);
    if (user) {
      user._id = user._id.toString(); // mongo's id is an object
      return done(null, user);
    }
    const newUser = {
      email: profile.email || "",
      authId: authId,
      accountName: profile.displayName,
      password: "",
    };
  });
};

passport.deserializeUser((id, done) => User.getById(id, (err, user) => err ? done(err, null) : done(null, user)));
passport.serializeUser((user, done) => done(null, user._id));


const
STRATEGY_LOCAL = new localStrategy({usernameField: "email",
                                    passwordField: "password"},
                                   LOCAL_STRATEGY),
STRATEGY_FACEBOOK = new facebookStrategy(facebookOptions, FACEBOOK_STRATEGY);

passport.use(STRATEGY_LOCAL);
passport.use(STRATEGY_FACEBOOK);
export default passport;
