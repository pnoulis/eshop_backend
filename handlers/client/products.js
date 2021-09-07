import Products from "#lib/products.js";
import log from "#log";

export const CLIENT_PRODUCT_HANDLERS = {
  read(req, res, next) {
    Products.getByTag(req.params.tag, (err, products) => {
      if (err) {
        log.error({what: "client failed to read product category", err});
        return next(err);
      }
      res.json({ok: true, payload: products});
    });
  },
};
