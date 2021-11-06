import mongoose from "mongoose";
import {redisClient} from "./redis.js";
import * as Models from "#models";
export {Redis, Mongoose};

const
Mongoose = {
  MODELS: {
    ...Models,
  },
  // returns (object || error)
  create(model, newDoc, cb) {
    try {
      return this.MODELS[model](newDoc).save(cb);
    } catch (err) {
      return cb(err);
    }
  },
  // returns (null || {...document})
  fetchById(model, id, {project, options = {}}, cb) {
    try {
      this.MODELS[model].findOne({_id: id}, project, options, cb);
    } catch (err) {
      cb(err);
    }
  },
  // returns (null, || {...document})
  fetchOne(model, {filter, project, options}, cb) {
    try {
      this.MODELS[model].findOne(filter, project, options, cb);
    } catch (err) {
      cb(err);
    }
  },
  // returns ([], || [ ...{...document} ]) empty array or array of objects
  fetchMany(model, {filter, project, options = {}}, cb) {
    try {
      this.MODELS[model].find(filter, project, options, cb);
    } catch (err) {
      cb(err);
    }
  },
  // where is an object with two properties. one is used to declare the
  // property in the mongo document that will be used to limit the results
  // and the other one is the conditions that need to be met. For example
  // if i want to fetch all products with a tag of "meat" then the where object
  // would be: {prop: "tags", conditions: ["meat"]}
  fetchWhere(model, projections, where, limit, cb) {
    try {
      this.MODELS[model].find({}, projections, {lean: true}).all(where.prop, ...where.conditions).limit(limit || 0).exec(cb);
    } catch (err) {
      cb(err);
    }
  },
  fetchProducts(model, tags, skip, limit, cb) {
    try {
      this.MODELS[model].find({}, "-_id pid description wpu ppu mu pu img tags inStock",
                              {lean: true}).all("tags", tags).skip(skip).limit(limit).exec(cb);
    } catch (err) {
      console.log(err);
      cb(err);
    }
  },
  // returns ({...document}) removed document
  removeOne(model, filter, options = {}, cb) {
    try {
      this.MODELS[model].findOneAndRemove(filter, options, cb);
    } catch (err) {
      cb(err);
    }
  },

  // returns (true || false)
  replaceOne(model, filter, newDoc, options = {}, cb) {
    try {
      this.MODELS[model].replaceOne(filter, newDoc, options, (err, document) => {
        if (err) return cb(err);
        if (!document.n || !document.nModified) return cb(null, false);
        cb(null, true);
      });
    } catch (err) {
      cb(err);
    }
  },

  // returns (integer)
  getDocCount(model, cb) {
    try {
      return this.MODELS[model].estimatedDocumentCount(cb);
    } catch (err) {
      cb(err);
    }
  },
},
Redis = {
  Hashes: {
    // return ({}), empty object if no hash matched
    getAll(nameOfHash, cb) {
      return cb ? redisClient.hgetall(nameOfHash, cb) :
        redisClient.hgetall(nameOfHash);
    },
    get(nameOfHash, ...nameOfKeys) {
      return redisClient.hmget(nameOfHash, ...nameOfKeys);
    },
    // returns (integer) 0 if no properties were set, or +n for the properties that were
    set(nameOfHash, ...keysValues) {
      return redisClient.hset(nameOfHash, ...keysValues);
    },
    // returns (integer) number of fields that were removed. If key does not exist
    // or no field was removed, return is 0
    del(nameOfHash, ...keyNames) {
      return redisClient.hdel(nameOfHash, ...keyNames);
    },
    // returns (integer), number of keys that were removed, 0 if none
    delAll(...nameOfHashes) {
      return redisClient.del(...nameOfHashes);
    },
    // returns (integer) the value of the property after the operation
    incr(nameOfHash, key, amount, cb) {
      return cb ? redisClient.hincrby(nameOfHash, key, amount, cb) :
        redisClient.hincrby(nameOfHash, key, amount);
    },
    // returns (integer) the value of the property after the operation
    decr(nameOfHash, key, amount, cb) {
      return cb ? redisClient.hincrby(nameOfHash, key, -1 * amount, cb) :
        redisClient.hincrby(nameOfHash, key, -1 * amount);
    },
    // return (integer) 0 if not found, 1 if found
    existsKey(nameOfHash, ...keyExists) {
      return redisClient.hexists(nameOfHash, ...keyExists);
    },
    existsHash(...nameOfHashes) {
      return redisClient.exists(...nameOfHashes);
    },
    keys(nameOfHash, cb) {
      return cb ? redisClient.hkeys(nameOfHash, cb) :
        redisClient.hkeys(nameOfHash);
    },
    // returns (object), {} empty if no properties, or {...} filled
    values(nameOfHash, cb) {
      return cb ? redisClient.hgetall(nameOfHash, cb) :
        redisClient.hgetAll(nameOfHash);
    },
  },
  Sets: {
    // returns (integer) the number of items added or 0 if none added
    // if for example a member exists already it will still call 0
    add(nameOfSet, ...members) {
      return redisClient.sadd(nameOfSet, ...members);
    },
    // returns (array) with the matches or empty if nothing matched
    get(...nameOfSets) {
      return redisClient.sinter(...nameOfSets);
    },
    // returns (integer) the number of items deleted or 0 if none were deleted
    del(nameOfSet, ...nameOfMembers) {
      return redisClient.srem(nameOfSet, ...nameOfMembers);
    },
    // returns (integer) 1 if its a member, 0 if its not
    isMember(nameOfSet, ...members) {
      return redisClient.sismember(nameOfSet, ...members);
    },
    exists(...nameOfSets) {
      return redisClient.exists(...nameOfSets);
    },
  },
  Queues: {
    size(queue, cb) {
      return cb ? redisClient.llen(queue, cb) :
        redisClient.llen(queue);
    },
    push(queue, ...items) {
      return redisClient.lpush(queue, ...items);
    },
    rpop(queue, count, cb) {
      return cb ? redisClient.rpop(queue, count, cb) :
        redisClient.rpop(queue, count);
    },
    lpop(queue, count, cb) {
      return cb ? redisClient.lpop(queue, count, cb) :
        redisClient.lpop(queue, count);
    },
    get(queue, cb) {
      return cb ? redisClient.lrange(queue, 0, -1, cb) :
        redisClient.lrange(queue, 0, -1);
    }

  },
  Strings: {},
};

