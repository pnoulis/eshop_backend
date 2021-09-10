import Account from "./account.js";
import Cart from "./cart.js";
import Address from "./address.js";
import User from "./user.js";


function USER_FACTORY(session) {
  User.state = session.state || {};
  User.cart = Cart;
  User.address = Address;
  User.account = Account;
  return Object.create(User);
}

export default USER_FACTORY;
