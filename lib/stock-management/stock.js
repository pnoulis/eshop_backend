import {Redis} from "#databases";
import Products from "#lib/products.js";
import log from "#log";

const
STOCK_INDEX = "stock:index",
STOCK_KEY = (pid) => `stock:${pid}`,
INDEX = Redis.Sets,
STOCK = Redis.Hashes;

const
createRecord = (stock, cb) => STOCK.set(STOCK_KEY(stock.pid), "rstock", stock.stock, "vstock", "[]", cb),
addIndex = (stock, cb) => INDEX.add(STOCK_INDEX, STOCK_KEY(stock.pid), cb),
setStock = (stock, cb) => STOCK.set(STOCK_KEY(stock.pid), "rstock", stock.rstock, "vstock", stock.vstock, cb),
getStock = (pid, cb) => STOCK.getAll(STOCK_KEY(pid), cb);
export
const
Stock = {
  init() {
    Products.getStock((err, pids) => {
      if (err) {
        err.trace ? err.trace += ".initStock" : err.trace = ".initStock";
        log.error({ok: false, err});
      }

      const x = (i) => {
        if (i === pids.length) return;

        createRecord(pids[i], (err, record) => {
          if (err) {
            err.trace = "createRecord.stock.init";
            log.error({ok: false, stock: pids[i], err});
            return x(++i);
          }

          addIndex(pids[i], (err) => {
            if (err) {
              err.trace = "addIndex.createRecord.init.stock";
              log.error({ok: false, stock: pids[i], err});
              return x(++i);
            }

            log.info({ok: "stock record and index created", stock: pids[i]});
            return x(++i);
          });

        });
      };

      x(0);
    });
  },
  get(pid, cb) {
    getStock(pid, (err, stock) => {
      if (err) {
        err.trace = "redis.getAll.get.stock";
        return cb(err);
      }
      if (!Object.keys(stock).length) return cb(null, null);

      try {
        stock.vstock = JSON.parse(stock.vstock);
        cb(null, stock);
      } catch (err) {
        err.trace = "JSON.parse.get.Stock";
        cb(err, null);
      }
    });
  },


  isStockAvailable(pid, cb) {
    this.get(pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock) return cb(null, false);
      if (stock.vstock.length >= stock.rstock) return cb(null, false);
      cb(null, stock); // returns the actual redis fields
    });
  },

  take(req, cb) {
    this.isStockAvailable(req.pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock) {
        req.ok = false;
        req.reason = "out of stock";
        return cb(null, req);
      }

      for (let i = 0; i < req.amount; i++) {
        stock.vstock.push(Date.now());
      }

      try {
        stock.vstock = JSON.stringify(stock.vstock);
        setStock({pid: req.pid, ...stock}, (err, updated) => {
          if (err) {
            req.ok = false;
            req.reason = "err";
            err.trace = ".upadteStock.take.stock";
            return cb(err);
          }
          req.ok = true;
          return cb(null, req);
        });
      } catch (err) {
        err.trace = ".JSON.stringify.take.stock";
        return cb(err);
      }
    });
  }
};
