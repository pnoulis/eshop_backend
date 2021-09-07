import express from "express";
import multer from "multer";
import {handleImageUpload, deleteImages, PRODUCT_HANDLERS} from "#handlers";

const
IMG_FIELD = "img",
upload = multer({storage: multer.memoryStorage()}),
Router = express.Router(),
parseJSON = (req, res, next) => {
  try {
    JSON.parse(req.body);
    req.body = JSON.parse(req.body);
    return next();
  } catch (err) {
    return next();
  }
};


// create product
Router.post(
  "/api/product",
  upload.single(IMG_FIELD),
  parseJSON,
  handleImageUpload,
  PRODUCT_HANDLERS.create,
  PRODUCT_HANDLERS.read,
);

// read product
Router.get(
  "/api/products",
  PRODUCT_HANDLERS.read
);

// update product
Router.put(
  "/api/product",
  upload.single(IMG_FIELD),
  parseJSON,
  handleImageUpload,
  deleteImages,
  PRODUCT_HANDLERS.update,
  PRODUCT_HANDLERS.read,
);

// delete product
Router.delete(
  "/api/product",
  parseJSON,
  PRODUCT_HANDLERS.delete,
  deleteImages,
  PRODUCT_HANDLERS.read,
);

export default Router;
