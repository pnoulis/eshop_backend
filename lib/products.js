import {Mongoose} from "#databases";

export
const
MONGOOSE_MODEL = "products",
genPid = (cb) => {
  Mongoose.getDocCount(MONGOOSE_MODEL, (err, count) => {
    if (err) {
      err.trace = "mongoose.getDocCount.genPid.";
      return cb(err);
    }
    cb(null, "PO-0" + count);
  });
};


const Products = {
  getStock(cb) { // used by stock-management
    Mongoose.fetchMany(MONGOOSE_MODEL, {project: "pid stock vstock pu mu wpu ppu", options: {lean: true}}, (err, products) => {
      if (err) {
        err.trace = "mongoose.fetchMany.getPids.Products";
        return cb(err);
      }
      cb(null, products);
    });
  },
  getAll(cb) {
    Mongoose.fetchMany(MONGOOSE_MODEL, {options: {lean: true}}, (err, products) => {
      if (err) {
        err.trace = "mongoose.fetchMany.getAll.Products";
        return cb(err);
      }
      cb(null, products);
    });
  },
  getByTag(tags, cb) {
    let conditions = [];
    try {
      tags = JSON.parse(tags);
      if (!(tags instanceof Array)) {
        return cb(new Error("getByTag expects either a string or an array"));
      }
      conditions = tags;
    } catch (err) {
      conditions = [tags];
    }

    Mongoose.fetchWhere(
      MONGOOSE_MODEL,
      "-_id pid description wpu ppu mu pu img tags inStock",
      {prop: "tags", conditions},
      (err, products) => {
        if (err) return cb(err);
        return cb(null, products);
      }
    );
  },
  create(product, cb) {
    genPid((err, pid) => {
      if (err) {
        err.trace += "create.Products";
        return cb(err);
      }
      product.pid = pid;
      product.tags = JSON.parse(product.tags);

      Mongoose.create(MONGOOSE_MODEL, product, (err, created) => {
        if (err) {
          err.trace = "mongoose.create.create.Products";
          return cb(err);
        }

        cb(null, created);
      });
    });
  },
  update(update, cb) {
    Mongoose.replaceOne(MONGOOSE_MODEL, {_id: update._id}, update, {lean: true}, (err, updated) => {
      if (err) {
        err.trace = ".mongoose.replaceOne.update";
        return cb(err);
      }

      if (!updated) {
        return cb(null, false);
      }

      cb(null, updated);
    });
  },
  delete(id, cb) {
    Mongoose.removeOne(MONGOOSE_MODEL, {_id: id}, {lean: true}, (err, deleted) => {
      if (err) {
        err.trace = ".mongoose.removeOne.delete";
        return cb(err);
      }
      return cb(null, deleted);
    });
  },
};

export default Products;
