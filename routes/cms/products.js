import express from "express";
import multer from "multer";
import {Products} from "#products";
import {handleImageUpload, deleteImages} from "#handlers";

const
IMG_FIELD = "img",
upload = multer({storage: multer.memoryStorage()}),
Router = express.Router();

// create product
Router.post(
  "/api/product",
  upload.single(IMG_FIELD),
  handleImageUpload,
  (req, res, next) => Products.add(req, res, next),
);

// read product
Router.get(
  "/api/products",
  (req, res, next) => Products.get(req, res, next),
);

// update product
Router.put(
  "/api/product",
  upload.single(IMG_FIELD),
  handleImageUpload,
  deleteImages,
  (req, res, next) => Products.change(req, res, next),
);

// delete product
Router.delete(
  "/api/product",
  deleteImages,
  (req, res, next) => Products.delete(req, res, next),
);

export default Router;
