const
ONE_YEAR = 31557600000,
ONE_MONTH = 2629800000,
ONE_WEEK = 604800000,
THREE_DAYS = 259200000,
ONE_DAY = 86400000,
ONE_HOUR = 3600000,
HALF_HOUR = 1800000,
TEN_MINUTES = 600000,
ONE_MINUTE = 60000,
THIRTY_SECONDS  = 30000,
TEN_SECONDS = 10000,
ONE_SECOND = 1000,
COUNT_IN = (expireIn, countIn) => {
  switch (countIn) {
  case "years":
    return Math.floor(expireIn / ONE_YEAR);
  case "months":
    return Math.floor(expireIn / ONE_MONTH);
  case "hours":
    return Math.floor(expireIn / ONE_HOUR);
  case "minutes":
    return Math.floor(expireIn / ONE_MINUTE);
  case "seconds":
    return Math.floor(expireIn / ONE_SECOND);
  default: // milliseconds
    return expireIn;
  }
},
START_FROM = (expireIn, countIn, startFrom) => {
  switch (startFrom) {
  case "now":
    return COUNT_IN(expireIn - Date.now(), countIn);
  default: // epoch
    return COUNT_IN(expireIn, countIn);
  }
},
expireIn = ({expireIn, countIn, startFrom}) => { // if no format, then time is milliseconds since epoch
  switch (expireIn) {
  case "1w":
    return START_FROM(Date.now() + ONE_WEEK, countIn, startFrom);
  case "3d":
    return START_FROM(Date.now() + THREE_DAYS, countIn, startFrom);
  case "1d":
    return START_FROM(Date.now() + ONE_DAY, countIn, startFrom);
  case "1h":
    return START_FROM(Date.now() + ONE_HOUR, countIn, startFrom);
  case "30m":
    return START_FROM(Date.now() + HALF_HOUR, countIn, startFrom);
  case "10m":
    return START_FROM(Date.now() + TEN_MINUTES, countIn, startFrom);
  case "1m":
    return START_FROM(Date.now() + ONE_MINUTE, countIn, startFrom);
  case "30s":
    return START_FROM(Date.now() + THIRTY_SECONDS, countIn, startFrom);
  case "10s":
    return START_FROM(Date.now() + TEN_SECONDS, countIn, startFrom);
  default: // now
    return START_FROM(Date.now(), countIn, startFrom);
  }
},
TIME = {
  expireIn,
};

export default TIME;
export {expireIn};
