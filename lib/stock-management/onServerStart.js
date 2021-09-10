import Products from "#lib/products.js";
import {Stock, Index} from "./stock.js";
import TIME from "#misc/time.js";
import log from "#log";

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


Stock.bootstrap = function(cb) {
  this.flush(err => {
    if (err && err.name !== "StockError") return cb(err);
    err && log.error({err});

    return Products.getStock((err, stock) => {
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
            notExpiredLeases = products.filter(timestamp => !TIME.isExpired(timestamp, this.expires));
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


export {Stock, Index};
