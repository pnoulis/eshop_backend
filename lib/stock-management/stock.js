import {Redis} from "#databases";
import TIME from "#misc/time.js";
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
STOCK_TIMEOUT = TIME.expireIn({expireIn: "10s"}),
Stock = Object.create(new EventEmitter()),
Index = {
  key: "stock:index",
  redis: Redis.Sets,
};
Stock.redis = Redis.Hashes;
Stock.expires = STOCK_TIMEOUT;
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

Stock.lease = function(sid, pid, amount, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.get(pid, (err, stock) => {
      if (err) return cb(err);

      let i = 0;
      for (; i < amount; ++i) {
        if (stock.nleases >= stock.vstock) break;
        stock.leases.hasOwnProperty(sid) ?
          stock.leases[sid].push(Date.now()) :
          stock.leases[sid] = [Date.now()];
        ++stock.nleases;
      }

      return this.set(pid, stock, err => err ? cb(err) : cb(null, i));
    });
  });
};

Stock.buy = function(sid, pid, amount, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.get(pid, (err, stock) => {
      if (err) return cb(err);

      let i = amount;
      while (stock.vstock > 0 || i > 0) {
        stock.leases[sid] && stock.leases[sid].length ? stock.leases[sid].pop() : delete stock.leases[sid];
        --stock.vstock;
        --i;
        --stock.nleases;
      }

      return this.set(pid, stock, err => err ? cb(err) : cb(null, i));
    });
  });
};

Stock.return = function(sid, pid, amount, bought, cb) {
  this.exists(this.makeKey(pid), (err, exists) => {
    if (err) return cb(err);
    if (!exists) return cb(new StockError(`pid: ${pid} has no record in redis`));

    return this.get(pid, (err, stock) => {
      if (err) return cb(err);
      while (amount > 0) {
        !bought && stock.leases[sid] ? stock.leases[sid].pop() : delete stock.leases[sid];
        !bought ? --stock.nleases : ++stock.vstock;
        --amount;
      }

      return this.set(pid, stock, err => err ? cb(err) : cb(null));
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

export {Stock, Index};
