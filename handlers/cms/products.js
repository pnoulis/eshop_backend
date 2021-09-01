import Products from "#lib/products.js";
import log from "#log";


export const PRODUCT_HANDLERS = {
  create(req, res, next) {
    Products.create(req.body, (err, created) => {
      if (err) {
        err.trace += "route: post:'/api/product'`";
        log.error(err);
        return next();
      }

      log.info({ok: "product created", newProduct: {_id: created._id, pid: created.pid}});
      return next();
    });
  },
  read(req, res, next) {
    Products.getAll((err, products) => {
      if (err) {
        err.trace += ".router get:'/api/product'";
        log.error(err);
        return next();
      }
      res.json({ok: true, payload: products});
    });
  },
  update(req, res, next) {
    Products.update(req.body, (err, updated) => {
      if (err) {
        err.trace += ".router put:'/api/product'";
        log.error(err);
        return next();
      }

      if (!updated) {
        log.error({ok: false, reason: "unknown", trace: ".Products.update.mongoose.replaceOne.routen put:`/api/product`" });
        res.json({ok: false});
      }

      log.info({ok: "product updated", updated: {pid: req.body.pid, id: req.body._id}});
      return next();
    });
  },
  delete(req, res, next) {
    Products.delete(req.body.id, (err, deleted) => {
      if (err) {
        err.trace += ".router delete:'/api/product";
        log.error(err);
        return next();
      }

      req.body.oldImg = req.body.img;
      log.info({ok: "product deleted", deleted: {pid: deleted.pid, id: deleted._id}});
      return next();
    });
  },
};
