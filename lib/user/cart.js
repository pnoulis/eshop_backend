import User from "./events.js";
import log from "#log";
import Stock from "#lib/stock.js";

const Cart = Object.create(User);

Cart.add = function(req, res, next) {
  const cart = this.state.get("cart");
  Stock.lease(this.state.id, req.body.pid, req.body.amount,
              cart[req.body.pid] ? cart[req.body.pid].amount : 0, (err, amount) => {
                if (err) return next(err);
                if (cart[req.body.pid]) cart[req.body.pid].amount += amount;
                else cart[req.body.pid] = {amount};
                this.state.set();
                return res.json({ok: true, payload: {pid: req.body.pid, amount}});
  });
};
Cart.remove = function(req, res, next) {
  const cart = this.state.get("cart");
  if (!cart[req.body.pid]) return res.json({ok: true, payload: {pid: req.body.pid, amount: 0}});

  return Stock.return(this.state.id, req.body.pid, req.body.amount, err => {
    if (err) return next(err);
    for (let i = 0; i < req.body.amount; ++i) {
      if (!cart[req.body.pid].amount) {
        delete cart[req.body.pid].amount;
        break;
      }
      --cart[req.body.pid].amount;
    }
    return res.json({ok: true, payload: {pid: req.body.pid, amount: req.body.amount}});
  });
};
Cart.calculate = function(cb) {
  const
  pids = Object.keys(this.state.get("cart")).splice(1, 1),
  cart = this.state.get("cart");
  cart.meta.price = 0; cart.meta.weight = 0; cart.meta.amount = 0;

  const x = (i) => {
    if (i === pids.length) return cb(null);
    return Stock.get(pids[i], (err, stock) => {
      if (err) {
        log.error({err});
        return x(++i);
      }
      cart[pids[i]].price = Number(stock.ppu) * cart[pids[i]].amount;
      cart[pids[i]].weight = Number(stock.wpu) * cart[pids[i]].amount;
      cart.meta.price += cart[pids[i]].price;
      cart.meta.weight += cart[pids[i]].weight;
      cart.meta.amount += cart[pids[i]].amount;
      return x(++i);
    });
  };
  return x(0);
};
Cart.buy = function(cb) {
  const
  pids = Object.keys(this.state.get("cart")).splice(1, 1),
  cart = this.state.get("cart");

  const x = (i) => {
    if (i === pids.length) return this.calculate(cb);
    return Stock.extendLease(this.state.id, pids[i], cart[pids[i]].amount, (err, extended) => {
      if (err) {
        log.error({err});
        return x(++i);
      }
      cart[pids].amount = extended;
      return x(++i);
    });
  };
  return x(0);
};

export default Cart;
