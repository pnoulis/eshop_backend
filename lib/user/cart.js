import User from "./events.js";
import log from "#log";
import {Stock, Products} from "#products";

const Cart = Object.create(User);

Cart.getPids = function() {
  const pids = Object.keys(this.state.get("cart"));
  pids.shift();
  return pids;
};
Cart.get = function(req, res, next) {
  const pids = this.getPids();
  if (!pids.length) return res.json({ok: true, payload: {products: [], cart: {meta: {amount: 0}}}});
  Products.getCart(pids, (err, cart) => {
    if (err) return next(err);
    this.calculate(() => res.json({ok: true, payload: {
      products: cart, cart: this.state.get("cart")
    }}));
  });
};
Cart.add = function(req, res, next) {
  const cart = this.state.get("cart");
  Stock.lease(this.state.id, req.body.pid, req.body.amount,
              cart[req.body.pid] ? cart[req.body.pid].amount : 0, (err, amount, stock) => {
                if (err) return next(err);
                if (amount) {
                  if (cart[req.body.pid]) cart[req.body.pid].amount += amount;
                  else cart[req.body.pid] = {amount};
                  ++cart.meta.amount;
                  this.state.set();
                }
                return res.json({ok: true, payload: {pid: req.body.pid, amount, ppu: stock.ppu, wpu: stock.wpu}});
  });
};
Cart.remove = function(req, res, next) {
  const cart = this.state.get("cart");
  console.log("old cart");
  console.log(cart);
  console.log("remove amount");
  console.log(req.body);
  if (!cart[req.body.pid]) return res.json({ok: true, payload: {pid: req.body.pid, leaseTimeout: true}});

  return Stock.return(this.state.id, req.body.pid, req.body.amount, (err, amount, stock )=> {
    if (err) return next(err);
    for (let i = 0; i < req.body.amount; ++i) {
      console.log("removing");
      --cart[req.body.pid].amount;
      --cart.meta.amount;
      if (!cart[req.body.pid].amount) {
        delete cart[req.body.pid];
        break;
      }
    }
    console.log("finished removing");
    console.log(cart[req.body.pid]);
    return res.json({ok: true, payload: {pid: req.body.pid,
                                         amount, ppu: stock.ppu,
                                         wpu: stock.wpu,
                                        }});
  });
};
Cart.calculate = function(cb) {
  const
  pids = Object.keys(this.state.get("cart")), // removes meta
  cart = this.state.get("cart");
  cart.meta.price = 0; cart.meta.weight = 0; cart.meta.amount = 0;
  pids.shift(); // removes meta
  let current = "";

  const x = (i) => {
    if (i === pids.length) return cb(null);
    current = pids[i];
    return Stock.get(current, (err, stock) => {
      if (err) {
        log.error({err});
        return x(++i);
      }
      cart[current].ppu = Number(stock.ppu);
      cart[current].tp = cart[current].ppu * cart[current].amount;
      cart[current].wpu = Number(stock.wpu);
      cart[current].tw = cart[current].wpu * cart[current].amount;
      cart.meta.price += cart[current].tp;
      cart.meta.weight += cart[current].tw;
      cart.meta.amount += cart[current].amount;
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
