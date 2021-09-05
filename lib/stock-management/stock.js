import {Redis} from "#databases";
import Products from "#lib/products.js";
import TIME from "#misc/time.js";
import log from "#log";

const
STOCK_INDEX = "stock:index",
STOCK_KEY = (pid) => `stock:${pid}`,
INDEX = Redis.Sets,
STOCK = Redis.Hashes,
STOCK_TIMEOUT = TIME.expireIn({expireIn: "30m"});


const
deleteRecord = (pid, cb) => STOCK.delAll(STOCK_KEY(pid), cb),
createRecord = (stock, cb) => STOCK.set(
  STOCK_KEY(stock.pid), "rstock", stock.stock, "vstock", "[]",
  "pu", stock.pu, "wpu", stock.wpu, "mu", stock.mu, "ppu", stock.ppu, cb
),
addIndex = (stock, cb) => INDEX.add(STOCK_INDEX, stock.pid, cb),
removeIndex = (pid, cb) => INDEX.del(STOCK_INDEX, pid, cb),
readIndex = (cb) => {
  INDEX.get(STOCK_INDEX, (err, index) => {
    if (err) {
      err.trace = "index.get.readIndex";
      log.error({ok: false, stockIndex: STOCK_INDEX, err,});
      return cb(err);
    }

    if (!index.length) {
      log.warn({stockIndex: STOCK_INDEX, what: "redis index of stock is empty"});
      return cb(null, false);
    }
    cb(null, index);
  });
},
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
        log.error({ok: false, ...stock, err});
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
    log.error({ok: false, ...stock, err});
    return cb(err);
  }
},
isStockAvailable = (pid, cb) => {
  getStock(pid, (err, stock) => {
    if (err) return cb(err);
    if (!stock) return cb(null, false);
    if (stock.vstock.length >= stock.rstock) return cb(null, false);
    cb(null, stock); // returns the actual redis fields
  });
},
timeout = () => {
  readIndex((err, index) =>{
    if (err || !index) return;

    const x = (i) => {
      if (i === index.length) return log.info({ok: true, what: "expired stocks placed back"});

      getStock(index[i], (err, stock) => {
        if (err || !stock) {
          log.error({ok: false, pid: index[i], track: "getStock.timeout", what: "stock not found"});
          return x(++i);
        }

        let expired = 0;
        for (let i = 0; i < stock.vstock.length; i++) {
          TIME.isExpired(stock.vstock[i], STOCK_TIMEOUT) && ++expired;
        }

        for (let i = expired; i > 0; --i) {
          stock.vstock.shift();
        }

        expired && setStock({pid: index[i], ...stock}, (err, set) => {
          if (err || !set) log.error({ok: false, pid: index[i],
                                      what: "SERIOUS ERROR - stock expired but not set"});
        });

        x(++i);
      });
    };

    x(0);
  });
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

    setInterval(timeout, STOCK_TIMEOUT);
  },

  requestStock(req, cb) {
    isStockAvailable(req.pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock) {
        req.ok = false;
        req.reason = "out of stock";
        return cb(null, req);
      }

      req.stock = [];

      for (let i = 0; i < req.amount; i++) {
        req.stock.push(Date.now());
        stock.vstock.push(req.stock[i]);
      }

      setStock({pid: req.pid, ...stock}, (err, set) => {
        if (err || !set) {
          req.ok = false;
          req.reason = "unknown";
          return cb(null, req);
        }
        req.ok = true;
        cb(null, req);
      });
    });
  },

  getInfo(pid, cb) {
    return getStock(pid, cb);
  },
  returnStock(req) {
    getStock(req.pid, (err, stock) => {
      if (err || !stock || !stock.vstock.length) return;
      let found = "";
      for (let i = 0; i < req.amount; i++) {
        found = stock.vstock.findIndex(el => el === req.stock[i]);
        if (stock !== -1) {
          stock.vstock.splice(stock, 1);
        }
      }
      setStock({pid: req.pid, ...stock}, () => {});
    });
  },

  createRedisStock(product) {
    createRecord(product, (err, record) => {
      if (err) {
        err.trace = "createRecord.stock.init";
        return log.error({ok: false, stock: product.pid, err});
      }

      addIndex(product, (err) => {
        if (err) {
          err.trace = "addIndex.createRecord.init.stock";
          return log.error({ok: false, stock: product.pid, err});
        }
        log.info({ok: "stock record and index created", pid: product.pidd});
      });
    });
  },
  removeRedisStock(pid) {
    deleteRecord(pid, (err, deleted) => {
      if (err || !deleted) {
        return log.error({ok: false, what: "stock record failed to get deleted", pid, err});
      }

      removeIndex(pid, (err, removed) => {
        if (err || !removed) {
          return log.error({ok: false, what: "stock index record failed to get deleted", pid, err});
        }

        log.info({ok: true, what: "redis stock record successfully removed", pid});
      });

    });
  },
};
