import {Stock, ShoppingCart, decodeCart, encodeCart} from "#stock-management";
import log from "#log";
export const CART_HANDLERS = {
  add(req, res, next) {
    Stock.requestStock(req.body.request, (err, request) => {
      if (err) return next(err);
      if (!request.ok) {
        return res.json({ok: false, payload: {flashMessage: request.reason === "out of stock" ? "FCartNoStock" : "Funknown"}});
      }

      if (req.body.cart[request.pid]) {
        req.body.cart[request.pid] = [...req.body.cart[request.pid], ...request.stock];
      } else {
        req.body.cart[request.pid] = request.stock;
      }
      return next();
    });
  },
  remove(req, res, next) {
    if (!req.body.cart[req.body.request.pid]) return next();
    req.body.request.stock = req.body.cart[req.body.request.pid];
    Stock.returnStock({...req.body.request});
    req.body.cart[req.body.request.pid].shift();
    if (!req.body.cart[req.body.request.pid].length) delete req.body.cart[req.body.request.pid];
    return next();
  },
  delete(req, res, next) {
    if (!req.body.cart[req.body.request.pid]) return next();
    req.body.request.stock = req.body.cart[req.body.request.pid];
    req.body.request.amount = req.body.request.stock.length;
    Stock.returnStock(req.body.request);
    delete req.body.cart[req.body.request.pid];
    return next();
  },
  review(req, res, next) {
    ShoppingCart.calculateCost(req.body.cart, false, (err, cost) => {
      if (err) return next(err);
      res.json({ok: true, payload: cost});
    });
  },
  decodeCart(req, res, next) {
    decodeCart(req.body.cart, (err, cart) => {
      if (err) {
        log.error({ok: false, what: "decoding cart", err});
      }
      req.body.cart = err ? {} : cart;
      return next();
    });
  },
  encodeCart(req, res, next) {
    encodeCart(req.body.cart, (err, token) => {
      if (err) return next(err);
      return res.json({ok: true, payload: {token, amount: req.body.request.amount}});
    });
  },
};
