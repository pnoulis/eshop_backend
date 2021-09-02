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
getStock = (pid, cb) => {
  STOCK.getAll(STOCK_KEY(pid), (err, stock) => {
    if (err) {
      err.trace = "redis.getAll.get.stock";
      log.error({ok: false, pid, err});
      return cb(err);
    }

    if (!Object.keys(stock).length) {
      log.info({pid, what: "requested pid does not have a redis record"});
      return cb(null, false);
    }

    try {
      stock.vstock = JSON.parse(stock.vstock);
      cb(null, stock);
    } catch (err) {
      err.trace = "JSON.parse.get.Stock";
      log.error({ok: false, pid, err});
      cb(err);
    }
  });
},
setStock = (stock, cb) => {
  try {
    stock.vstock = JSON.stringify(stock.vstock);
    STOCK.set(STOCK_KEY(stock.pid), "rstock", stock.rstock, "vstock", stock.vstock, (err, stock) => {
      if (err) {
        err.trace = "getStock.getAll.STOCK";
        return cb(err);
      }

      if (stock) {
        log.info({...stock, what: "setStock operation created properties"});
        return cb(null, false);
      }

      cb(null, true);
    });
  } catch (err) {
    err.trace = "JSON.stringify.getStock.set.STOCK";
    return cb(err);
  }
};
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

  isStockAvailable(pid, cb) {
    getStock(pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock) return cb(null, false);
      if (stock.vstock.length >= stock.rstock) return cb(null, false);
      cb(null, stock); // returns the actual redis fields
    });
  },

  requestStock(req, cb) {
    this.isStockAvailable(req.pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock) return cb(null, false, "out of stock");

      for (let i = 0; i < req.amount; i++) {
        stock.vstock.push(Date.now());
      }

      setStock({pid: req.pid, ...stock}, (err, set) => {
        if (err || !set) return cb(null, false, "unknown");
        cb(null, req);
      });
    });
  },

  returnStock(req) {
    getStock(req.pid, (err, stock) => {
      if (err || !stock || !stock.vstock.length) return;
      for (let i = 0; i < req.amount; i++) {
        stock.vstock.pop();
      }
      setStock({pid: req.pid, ...stock}, () => {});
    });
  },

};
