import {Mongoose} from "#databases";
import Hash from "#lib/misc/uuid.js";
import {Account} from "./user.js";

Account.model = "users";
Account.getById = function(id, cb) {
  return Mongoose.fetchById(this.model, id, {options: {lean: true}}, cb);
};
Account.getByEmail = function(email, cb) {
  return Mongoose.fetchOne(this.model, {filter: {email}, options: {lean: true}}, cb);
};
Account.verifyPassword = function(password, user, cb) {
  return Hash.matchPassword(password, user.password, cb);
};
Account.isDuplicate = function (email, cb) {
  return this.getByEmail(email, cb);
};

Account.hashPassword = function(password, cb) {
  return Hash.hashPassword(password, cb);
};
Account.create = function(user, cb) {
  return Mongoose.create(this.model, user, cb);
};

export default Account;
