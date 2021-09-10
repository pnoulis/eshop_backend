import {Cart} from "./user.js";

Cart.get = function() {
  console.log(`hi iam the cart.get function`);
  console.log(this.state);
};

export default Cart;
