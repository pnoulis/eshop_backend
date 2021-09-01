import {v4} from "uuid";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import config from "#config";

const Hash = {
  generateUuid() {
    return v4();
  },
  hashPassword(plainTextPassword, cb) {
    const saltRounds = 10;
    return bcrypt.hash(plainTextPassword, saltRounds, cb);
  },
  matchPassword(plainTextPassword, hash, cb) {
    return bcrypt.compare(plainTextPassword, hash, cb);
  },
  encrypt(string = "") {
    return CryptoJS.AES.encrypt(string, config.credentials.secretKey).toString();
  },
  decrypt(cipher = "") {
    return CryptoJS.AES.decrypt(cipher, config.credentials.secretKey).toString(CryptoJS.enc.Utf8);
  },
};

export default Hash;
