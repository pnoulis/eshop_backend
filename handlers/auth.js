import log from "#log";
import Session from "#session";
import User from "#lib/user.js";
import passport from "#lib/auth/passport.js";

export
const
AUTH_HANDLERS = {
  local(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        log.error({operation: "login",  input: {...req.body}, err});
        return res.json({ok: false, payload: {flashMessage: "FLoginFailure"}});
      }

      if (!user) return res.json(
        {ok: false, payload: {flashMessage: `FLogin${info.reason}`}}
      );

      res.locals.user = user;
      return next();
      next();
    })(req, res, next);
  },
  facebook(req, res, next) {
    passport.authenticate("facebook", {scope: ["email"]})(req, res, next);
  },
  facebookCallback(req, res, next) {
    passport.authenticate("facebook", (err, user, info) => {
      if (err) {
        return res.json({ok: false, payload: {info}});
      }
    });
  },

  login(req, res, next) {
    req.session.regenerate(err => {
      if (err) {
        log.error({oper: "session regenerate", err});
        return next(err);
      }

      if (!res.locals.user) {
        log.error({oper: "session login", reason: "res.locals.user object is empty"});
        return res.json({ok: false, payload: {flashMessage: "FLoginFailure"}});
      }

      req.login(res.locals.user, err => {
        if (err) {
          log.error({oper: "req.login", err});
          return next(err);
        }

        try {
          const {session, client} = Session.login(res.locals.user);
          req.session.state = session;
          return res.json({ok: true, payload: client});
        } catch (err) {
          log.error({oper: "session login", err});
          return next(err);
        }
      });
    });
  },

  logout(req, res, next) {
    try {
      req.logout();
      req.session.destroy(err => {
        if (err) {
          log.error({oper: "logout, req.session.destroy", err});
          return next(err);
        }

        res.json({ok: true});
      });
    } catch (err) {
      return next(err);
    }
  },

  register(req, res, next) {
    const user = Object.assign({}, req.body);
    User.isAccountDuplicate(user.email, (err, is) => {
      if (err) {
        log.error({what: "failed to verify duplicate account in register proccess", err});
        return next(err);
      }

      if (is) return res.json({ok: false, payload: {
        flashMessage: "FRegisterDuplicate"
      }});

      User.hashPassword(user.password, (err, hashed) => {
        if (err) {
          log.error({what: "failed to hash password in register proccess", err});
          return next(err);
        }

        user.loginMethod = "local";
        user.password = hashed;

        User.createUser(user, (err, created) => {
          if (err) {
            log.error({what: "failed to create user in register proccess", err});
            return next(err);
          }

          return next();
        });

      });
    });
  },
};

