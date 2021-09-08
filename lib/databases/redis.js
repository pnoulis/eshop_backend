import Redis from "ioredis";
import config from "#config";

const
redisConfig = {
  port: config.credentials.redis.port,
  host: config.credentials.redis.url,
  password: config.credentials.redis.password,
},
redisClient = new Redis({
  port: redisConfig.port,
  host: redisConfig.host,
  password: redisConfig.password,
  lazyConnect: true,
});

export {redisClient};
