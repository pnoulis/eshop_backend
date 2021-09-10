import User from "#user";
import {Stock} from "#stock-management";
const USER_EVENT = {};
USER_EVENT.login = function(req, res, next) {};
USER_EVENT.logout = function(req, res, next) {};
USER_EVENT.forgotPassword = function(req, res, next) {};
USER_EVENT.sendEmail = function(req, res, next) {};
USER_EVENT.addToCart = function(req, res, next) {
  const newUser = User({state: {name: "pavlos"}});
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(newUser)));
  console.log(newUser.cart.get());
  // User(req.session).cart.add(1);
  return next();
  // Stock.lease(req.sessionID, req.body.pid, req.body.amount, (err, leased) => {
  //   if (err) return next(err);
  //   new User(req.session).cart.add(leased).then()
  // });
  // Stock.lease(req.sessionID, req.body.pid, req.body.amount, (err, leased) => {
  //   if (err) return err;
  //   this.Session.dispatch("addCart", req.session, {pid: req.body.pid, leased});
  //   return req.json({ok: true, payload: {pid: req.body.pid, leased}});
  // });
};
USER_EVENT.removeFromCart = function(req, res, next) {
};
USER_EVENT.buyCart = function() {};
USER_EVENT.getCart  = function(req, res, next) {};
USER_EVENT.createOrder = function(req, res, next) {};
USER_EVENT.getOrder = function(req, res, next) {};
USER_EVENT.updateOrder = function(req, res, next) {};
USER_EVENT.deleteOrder = function(req, res, next) {};
USER_EVENT.createAddress = function(req, res, next) {};
USER_EVENT.getAddress = function(req, res, next) {};
USER_EVENT.updateAdress = function(req, res, next) {};
USER_EVENT.deleteAddress = function(req, res, next) {};
USER_EVENT.createAccount = function(req, res, next) {};
USER_EVENT.getAccount = function(req, res, next) {};
USER_EVENT.updateAccount = function(req, res, next) {};
USER_EVENT.deleteAccount = function(req, res, next) {};

export default USER_EVENT;
