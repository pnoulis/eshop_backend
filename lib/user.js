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
};

export default User;
