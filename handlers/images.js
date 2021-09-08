import sharp from "sharp";
import MyPath from "#lib/misc/paths.js";
import config from "#config";
import log from "#log";

const
format = "webp",
// assumng that the express server has a default root directory
// where resources are kept
imgSchemas = [
  { // tiny
    size: "tiny",
    ext: ".tiny.".concat("", format),
    sharpOpts: {
      width: 60,
      height: 60,
      options: {fit: "contain"},
    },
  },
  { // small
    size: "small",
    ext: ".small.".concat("", format),
    sharpOpts: {
      width: 100,
      height: 100,
      options: {fit: "contain"},
    },
  },
  { // medium
    size: "medium",
    ext: ".medium.".concat("", format),
    sharpOpts: {
      width: 150,
      height: 150,
      options: {fit: "contain"},
    },
  },
  { // large
    size: "large",
    ext: ".large.".concat("", format),
    sharpOpts: {
      width: 300,
      height: 300,
      options: {fit: "contain"},
    },
  },
],
makeDirPath = (imgName) => {
  imgName = new MyPath(imgName)
    .extractName()
    .mkLinuxCompliant().get();
  const
  dirPath = new MyPath(imgName).strToDir("relative", config.productsImgDir).get();

  return {dirPath, imgName};
};


export function handleImageUpload(req, res, next) {
  if (req.method === "PUT" && !req.file) return next();
  if (req.method === "POST" && !req.file) return res.json({
    ok: false, payload: {fieldErrors: {img: "Forgot to upload an image!"}}
  });

  const
  image = req.file,
  {dirPath, imgName} = makeDirPath(image.originalname);

  new MyPath().createDir(dirPath, (err) => {
    if (err) {
      log.error({oper: "upload-image, mypath.createDir", err});
      if (err.code === "EEXIST") return res.json({
        ok: false, payload: {flashMessage: "FProductImgDuplicate"}
      }); else next(err);
    }

    let imgPath = "", img = {};
    const sharpImg = sharp(image.buffer).webp(),
          promises = imgSchemas.map((schema, i) => {
            imgPath = dirPath.concat(imgName, schema.ext);
            img[schema.size] = {
              path: config.serverDomain.concat(
                imgPath.substring(imgPath.match(/\//).index)
              ),
              width: schema.sharpOpts.width + "px"
            };
            return sharpImg.clone().resize(schema.sharpOpts).toFile(imgPath);
          });

    Promise.all(promises)
      .then(() => {
        req.body.img = img;
        return next();
      }).catch(err => {
        log.error({oper: "upload-image sharp promises", err});
        return next(err);
      });
  });
}

export function deleteImages(req, res, next) {
  console.log(req.body);
  if (!req.body.oldImg) return next();
  const path = new MyPath(req.body.oldImg)
        .removeDomain()
        .removeFile()
        .addPublic();

  path.removeDir("", (err) => {
    if (err) {
      err.trace = ".router delete or put :'/api/product'. removeDir";
      log.error({ok: false, err});
      return next(err);
    }

    return next();
  });
}
