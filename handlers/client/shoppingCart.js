import {Stock, ShoppingCart, decodeCart, encodeCart, getStock, setStock} from "#stock-management";
import Session from "#session";
import log from "#log";
export const CART_HANDLERS = {
  addToCart(req, res, next) {
    Session.set(req.session, {
      pid: req.body.pid,
      stocks: res.locals.stocks,
    }, "addToCart");
    res.json({ok: true, payload: {pid: req.body.pid, amount: res.locals.stocks.length, session: req.session, sid: req.sessionID}});
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

  requestStock(req, res, next) {
    getStock(req.body.pid, (err, stock) => {
      if (err) return next(err);

      res.locals.stocks = [];
      for (let i = 0; i < req.body.amount; ++i) {
        if (stock.vstock.length >= stock.rstock) break;
        res.locals.stocks.push(Date.now());
        stock.vstock.push(res.locals.stocks[i]);
      }

      if (!res.locals.stocks.length) return res.json(
        {ok: false, payload: {flashMessage: "FoutOfStock"}}
      );

      setStock({pid: req.body.pid, ...stock}, (err, set) => {
        if (err || !set) return next(err);
        return next();
      });
    });
  }
};
