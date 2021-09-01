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
  getAll(cb) {
    Mongoose.fetchMany(MONGOOSE_MODEL, {options: {lean: true}}, (err, products) => {
      if (err) {
        err.trace = "mongoose.fetchMany.getAll.Products";
        return cb(err);
      }
      cb(null, products);
    });
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
