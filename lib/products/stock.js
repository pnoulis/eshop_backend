import {Redis} from "#databases";
import TIME from "#misc/time.js";
import {Products} from "./products.js";
import {EventEmitter} from "events";
import log from "#log";

class StockError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
const
STOCK_TIMEOUT = TIME.expireIn({expireIn: "30m"}),
Stock = Object.create(Products),
Index = {
  key: "stock:index",
  redis: Redis.Sets,
};
Stock.redis = Redis.Hashes;
Stock.expires = STOCK_TIMEOUT;
Stock.maxLeaseRatio = (vstock) => vstock > 0 ? Math.floor(vstock * 0.5) || 1 : 0;
Stock.makeKey = (pid) => `stock:${pid}`;
Stock.makeRecord = (stock) => [
  "vstock", stock.vstock,
  "nleases", stock.nleases || 0,
  "ppu", stock.ppu,
  "wpu", stock.wpu,
  "pu", stock.pu,
  "mu", stock.mu,
  "leases", stock.leases || "{}",
];
Stock.exists = function(skey, cb) {
  return this.redis.existsHash(skey, cb);
};
Stock.create = function(stock, cb) {
  this.exists(this.makeKey(stock.pid), (err, exists) => {
    if (err) return cb(err);
    if (exists) return cb(new StockError(`pid: ${stock.pid} already has a record in redis`));

    return this.redis.set(
      this.makeKey(stock.pid),
      ...this.makeRecord(stock),
      (err, set) => {
        if (err) return cb(err);
        if (!set) return cb(new StockError(`pid: ${stock.pid} record failed to be created in redis`));
        return this.emit("stock-created", stock.pid, cb);
      }
    );
  });
};
Stock.get = function(pid, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.redis.getAll(this.makeKey(pid), (err, stock) => {
      if (err) return cb(err);
      if (!Object.keys(stock).length) return cb(new StockError(`pid: ${pid} redis stock record is empty`));
      try {
        stock.leases = JSON.parse(stock.leases);
        stock.nleases = Number(stock.nleases);
        return cb(null, stock);
      } catch (err) {
        return cb(err);
      }
    });
  });
};

Stock.flush = function(cb) {
  Index.read((err, index) => {
    if (err) return cb(err);

    const x = (i) => {
      if (i === index.length) {
        log.info("stock redis image flushed");
        return cb(null);
      }

      return this.delete(index[i], err => {
        err && log.error({err});
        x(++i);
      });
    };

    return x(0);
  });
};

Stock.set = function(pid, stock, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));
    try {
      stock.leases = JSON.stringify(stock.leases);
    } catch (err) {
      return cb(err);
    }
    return this.redis.set(
      this.makeKey(pid),
      ...this.makeRecord(stock),
      (err, stock) => {
        if (err) return cb(err);
        return cb(null);
      }
    );
  });
};
Stock.delete = function(pid, cb) {
  this.exists(this.makeKey(pid) , (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.redis.delAll(this.makeKey(pid), (err, deleted) => {
      if (err) return cb(err);
      if (!deleted) return cb(new StockError(`pid: ${pid} failed to get deleted`));
      return this.emit("stock-deleted", pid, cb);
    });
  });
};

Stock.lease = function(sid, pid, amount, leased, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.get(pid, (err, stock) => {
      if (err) return cb(err);

      let i = 0;
      while (i < amount && leased < this.maxLeaseRatio(stock.vstock) &&
            stock.nleases < stock.vstock) {
        stock.leases.hasOwnProperty(sid) ?
          stock.leases[sid].push(Date.now()) :
          stock.leases[sid] = [Date.now()];
        ++stock.nleases;
        ++i;
        ++leased;
      }
      return this.set(pid, stock, err => err ? cb(err) : cb(null, i, stock));
    });
  });
};

Stock.extendLease = function(sid, pid, amount, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.get(pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock.leases[sid]) return this.lease(sid, pid, amount, cb);
      if (stock.leases[sid].length === amount) {
        for (let i = 0; i < amount; ++i) {
          stock.leases[sid][i] = Date.now();
        }
        return this.set(pid, stock, err => err ? cb(err) : cb(null));
      }

      return this.return(sid, pid, amount, err => {
        if (err) return cb(err);
        return this.lease(sid, pid, amount, cb);
      });
    });
  });
};

Stock.return = function(sid, pid, amount, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.get(pid, (err, stock) => {
      if (err) return cb(err);
      if (!stock.leases[sid]) return cb(null);
      let i = amount;
      while (i > 0 && stock.leases[sid]) {
        stock.leases[sid].pop();
        !stock.leases[sid].length && delete stock.leases[sid];
        --stock.nleases;
        --i;
      }
      return this.set(pid, stock, err => err ? cb(err) : cb(null, -(amount + i), stock));
    });
  });
};

Index.exists = function(pid, cb) {
  return this.redis.isMember(this.key, pid, cb);
};
Index.add = function(pid, cb) {
  this.exists(pid, (err, exists) => {
    if (err) return cb(err);
    if (exists) return cb(new StockError(`pid: ${pid} is already a member of the stock redis index`));

    return this.redis.add(this.key, pid, (err, created) => {
      if (err) return cb(err);
      if (!created) return cb(new StockError(`pid: ${pid} failed to be added to the stock redis index`));
      return cb(null);
    });
  });
};
Index.read = function(cb) {
  this.redis.exists(this.key, (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`redis stock index: ${this.key} does not exist`));

    return this.redis.get(this.key, (err, set) => {
      if (err) return cb(err);
      if (!set.length) return cb(new StockError(`redis stock index: ${this.key} is empty`));
      return cb(null, set);
    });
  });
};
Index.remove = function(pid, cb) {
  this.exists(pid, (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} is not a member of the stock redis index`));

    return this.redis.del(this.key, pid, (err, removed) => {
      if (err) return cb(err);
      if (!removed) return cb(new StockError(`pid: ${pid} failed to get removed from stock redis index`));
      return cb(null);
    });
  });
};

Stock.bootstrap = function(cb) {
  this.flush(err => {
    if (err && err.name !== "StockError") return cb(err);
    err && log.error({err});

    return this.getStock((err, stock) => {
      if (err) return cb(err);

      const x = (i) => {
        if (i === stock.length) {
          return this.emit("stock-bootstraped", cb);
        }

        return this.create(stock[i], err => {
          err && log.error({err});
          x(++i);
        });
      };

      return x(0);
    });
  });
};

Stock.timeoutLeases = function() {
  let notExpiredLeases = [];
  Index.read((err, index) => {
    if (err) {
      log.error({err});
      return null;
    }

    const x = (i) => {
      if (i === index.length) {
        log.info("expired stock leases removed!");
        return null;
      }
      return this.get(index[i], (err, stock) => {
        err && log.error({err});

        try {
          Object.entries(stock.leases).forEach(([lease, products]) => {
            notExpiredLeases = products.filter(timestamp => !TIME.isExpired(timestamp, Stock.expires));
            stock.nleases -= products.length - notExpiredLeases.length;
            notExpiredLeases.length ? products = notExpiredLeases : delete stock.leases[lease];
          });
        } catch (err) {
          log.error({err});
        }

        this.set(index[i], stock, err => {
          err && log.error({err});
          x(++i);
        });
      });
    };

    return x(0);
  });
};

Stock.on("product-deleted", deleted => {
  console.log("product deleted");
  console.log(deleted);
});
Stock.on("product-updated", updated => {
  console.log("product updated");
  console.log(updated);
});
Stock.on("stock-bootstraped", (cb) => {
  try {
    setInterval(() => Stock.timeoutLeases(), Stock.expires);
    log.info("stock system bootstrap completed!");
    return cb(null);
  } catch (err) {
    return cb(err);
  }
});
Stock.on("stock-created", (pid, cb) => {
  Index.add(pid, err => {
    if (err) return cb(err);
    log.info(`stock & index created from ${pid}`);
    return cb(null);
  });
});
Stock.on("stock-deleted", (pid, cb) => {
  Index.remove(pid, err => {
    if (err) return cb(err);
    log.info(`stock & index deleted for ${pid}`);
    return cb(null);
  });
});

export {Stock};
