import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {type: String, index: true},
  level: String,
  password: String,
  loginMethod: String,
  authId: String,
  addresses: [{
    postcode: String,
  }],
}, {versionKey: false});


export const users = mongoose.model("users", userSchema);
