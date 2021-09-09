import sharp from "sharp";
import MyPath from "#lib/misc/paths.js";
import config from "#config";
import log from "#log";

const
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

    let
    imgPath = dirPath.concat(imgName, ".350px.webp");

    const
    sharpImg = sharp(image.buffer).webp()
      .clone()
      .resize({
        width: 350,
        height: 350,
        options: {fit: "contain"},
      })
      .toFile(imgPath)
      .then(() => {
        imgPath = config.serverDomain.concat(
          imgPath.substring(imgPath.match(/\//).index)
        );
        req.body.img = imgPath;
        return next();
      })
      .catch(err => {
        log.error({what: "image upload failed", err});
        return next(err);
      });
  });
}

export function deleteImages(req, res, next) {
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
