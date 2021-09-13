import Account from "./account.js";
import Cart from "./cart.js";
import Address from "./address.js";
import User from "./events.js";

function USER_FACTORY(req, res, next) {
  User.cart = Cart;
  User.address = Address;
  User.account = Account;
  const user = Object.create(User);
  user.state.init(req.session);
  user.state.id = req.sessionID;
  res.locals.user = user;
  return next();
}

export default USER_FACTORY;
