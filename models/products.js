import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  pid: String, // customer facing id
  title: String,
  description: String,
  supplier: String,
  sid: String, // supplier id
  wpu: Number, // weight per unit
  ppu: Number, // price per unit
  tp: Number, // total price of items
  mu: String, // measuring unit
  pu: String, // price unit
  img: {
    dirPath: String,
    tiny: {path: String, width: String},
    small: {path: String, width: String},
    medium: {path: String, width: String},
    large: {path: String, width: String},
  },
  tags: [String],
  stock: Number,
  vstock: Number,
  inStock: Boolean,
}, {versionKey: false});


export const products = mongoose.model("products", productSchema);
