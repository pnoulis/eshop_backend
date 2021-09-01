import express from "express";
import multer from "multer";
import {handleImageUpload, deleteImages, PRODUCT_HANDLERS} from "#handlers";
import {genPid} from "#lib/products.js";
import MyPath from "#misc/paths.js";


const
IMG_FIELD = "img",
upload = multer({storage: multer.memoryStorage()}),
Router = express.Router();


// create product
Router.post(
  "/api/product",
  upload.single(IMG_FIELD),
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
  handleImageUpload,
  deleteImages,
  PRODUCT_HANDLERS.update,
  PRODUCT_HANDLERS.read,
);

// delete product
Router.delete(
  "/api/product",
  PRODUCT_HANDLERS.delete,
  deleteImages,
  PRODUCT_HANDLERS.read,
);

export default Router;
