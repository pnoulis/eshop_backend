import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  tag: String,
  class: String,
}, {versionKey: false});


export const tags = mongoose.model("tags", tagSchema);
