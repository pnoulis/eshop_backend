import {Mongoose} from "#databases";
import {EventEmitter} from "events";

const Products = Object.create(new EventEmitter());
Products.model = "products";
Products.maxClientDocs = 2;
Products.calculatePages = function(cb) {
  Mongoose.getDocCount(this.model, (err, count) => {
    if (err) return cb(err);
    return cb(null, Math.ceil(count / this.maxClientDocs) || 1);
  });
};

Products.getCart = function(pids, cb) {
  const project = "-_id img title pid description";
  const options = {lean: true};
  return Mongoose.fetchMany(
    this.model,
    {filter: {pid: pids}, project, options},
    (err, cart) => cb(err, cart),
  );
};
Products.getByTag = function(req, res, next) {
  try {
    req.params.page = parseInt(req.params.page);
    req.params.tags = JSON.parse(req.params.tags);
    if (!(req.params.tags instanceof Array)) {
      return next(new Error("tags must be either a string or an array"));
    }
  } catch (err) {
    req.params.tags = [req.params.tags];
  }


  return this.calculatePages((err, pages) => {
    if (err) return next(err);
    req.params.page = typeof req.params.page !== "number" || req.params.page > pages || req.params.page < 1 ? 0 : req.params.page - 1;
    return Mongoose.fetchProducts(
      this.model,
      req.params.tags,
      req.params.page * this.maxClientDocs,
      this.maxClientDocs,
      (err, products) => err ? next(err) : res.json({ok: true, payload: {products, pages, current: req.params.page}}),
    );
  });
};
Products.get = function(req, res, next) {
    return Mongoose.fetchMany(this.model, {options: {lean: true}}, (err, products) => {
    if (err) return next(err);
    return res.json({ok: true, payload: products});
  });
};
Products.genPid = function(cb) {
  Mongoose.getDocCount(this.model, (err, count) => {
    if (err) return cb(err);
    return cb(null, "PO-0" + count);
  });
};
Products.add = function(req, res, next) {
  this.genPid((err, pid) => {
    if (err) return next(err);
    req.body.pid = pid;
    req.body.tags = JSON.parse(req.body.tags);

    return Mongoose.create(this.model, req.body, (err, created) => {
      if (err ) return next(err);
      this.emit("product-created", created);
      return this.get(req, res, next);
    });
  });
};
Products.delete = function(req, res, next) {
  Mongoose.removeOne(this.model, {_id: req.body.id}, {lean: true}, (err, deleted) => {
    if (err) return next(err);
    this.emit("product-deleted", deleted);
    return this.get(req, res, next);
  });
};
Products.change = function(req, res, next) {
  Mongoose.replaceOne(this.model, {_id: req.body.id}, req.body, {lean: true}, (err, updated) => {
    if (err) return next(err);

    if (!updated) return res.json({ok: false});
    this.emit("product-updated", updated);
    return this.get(req, res, next);
  });
};
Products.getStock = function(cb) {
  Mongoose.fetchMany(this.model, {project: "-_id pid vstock pu mu wpu ppu", options: {lean: true}}, (err, products) => {
    if (err) return cb(err);
    return cb(null, products);
  });
};

export {Products};
