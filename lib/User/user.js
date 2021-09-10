import {EventEmitter} from "events";

const
User = Object.create(new EventEmitter()),
Cart = Object.create(User),
Address = Object.create(User),
Account = Object.create(User);

export {Cart, Address, Account, User};
export default User;
