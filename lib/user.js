import {expireIn} from "#lib/misc/time.js";
import {Mongoose} from "#databases";
import Hash from "#lib/misc/uuid.js";

const User = {
  model: "users",
  getById(id, cb) {
    const options = {lean: true};
    return Mongoose.fetchById(this.model, id, {options: {lean: true}}, cb);
  },
  getByEmail(email, cb) {
    return Mongoose.fetchOne(this.model, {filter: {email}, options: {lean: true}}, cb);
  },
  comparePasswords(password, user, cb) {
    return Hash.matchPassword(password, user.password, cb);
  },
  isAccountDuplicate(email, cb) {
    return User.getByEmail(email, cb);
  },
  hashPassword(password, cb) {
    return Hash.hashPassword(password, cb);
  },
  createUser(user, cb) {
    return Mongoose.create(this.model, user, cb);
  },
};

export default User;
