import {redisClient, mongoClient} from "#databases";
import log from "#log";

const check = (function() {
  let checkList = {mongo: false, redis: false};

  return (dependency) => {
    checkList[dependency] = true;
    console.log(`${dependency} online`);
    if (Object.values(checkList).every(item => !!item)) {
      console.log("App ready!");
    }
  };
})();

redisClient.connect()
  .then(() => {
    check("redis");
  }).catch(err => {
    log.error(err);
    process.exit(1);
  });

mongoClient
  .once("open", () => {
    check("mongo");
  })
  .on("error", err => {
    log.error(err);
    process.exit(1);
  });

export default check;