import {EventEmitter} from "events";
import Session from "#session";

class LoginError extends Error {
  constructor(messageOrError) {
    if (messageOrError instanceof Error) {
      super(messageOrError.message);
      this.name = this.constructor.name.concat(" " , messageOrError.name);
      Error.captureStackTrace(this, messageOrError.stack);
    } else {
      super(messageOrError);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
const
User = Object.create(new EventEmitter());
User.state = Session;
User.sendClient = function(req, state) {
  return {
    cart: state.cart,
    email: state.email,
    loggedIn: state.loggedIn,
    expires: Date.now() + req.session.cookie.maxAge,
  };
};
User.get = function(req, res, next) {
  return res.json({ok: true, payload: this.sendClient(req, this.state.get())});
};
User.login = function(req, res, next) {
  this.account.getByEmail(req.body.email, (err, user) => {
    if (err) return next(new LoginError(err));
    if (!user) return res.json({ok: false, payload: {flashMessage: "FLoginNoAccount"}});
    return this.account.verifyPassword(req.body.password, user, (err, areIdentical) => {
      if (err) return next(new LoginError(err));
      if (!areIdentical) return res.json({ok: false, payload: {flashMessage: "FLoginPassword"}});
      const state = this.state.get();
      if (state.level === "guest") {
        state.loggedIn = true;
        state.level = "user";
        state.email = user.email;
      } else {
        state.loggedIn = true;
        state.level = "user";
        state.email = user.email;
        state.cart = {meta: {total: 0}};
      }
      this.state.set();
      this.emit("account-login", user);
      return res.json({ok: true, payload: this.sendClient(req, this.state.get())});
    });
  });
};

User.logout = function(req, res, next) {
  return res.json({ok: true});
};

User.register = function(req, res, next) {
  const user = {...req.body};
  this.account.isDuplicate(user.email, (err, isDuplicate) => {
    if (err) return next(new LoginError(err));
    if (isDuplicate) return res.json({ok: false, payload: {flashMessage: "FRegisterDuplicate"}});
    return this.account.hashPassword(user.password, (err, hashed) => {
      if (err) return next(new LoginError(err));
      user.loginMethod = "local";
      user.password = hashed;
      user.level = "user";
      return this.account.create(user, (err, created) => {
        if (err) return next(new LoginError(err));
        this.emit("new-account-registered", created);
        return this.login(req, res, next);
      });
    });
  });
};



export default User;
