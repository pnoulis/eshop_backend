import {expireIn} from "#misc/time.js";

export
const
SESSION_TIMEOUT = expireIn({expireIn: "30m"}),
Session = {
  init() {
    return {
      loggedIn: false,
      timeOut: expireIn(SESSION_TIMEOUT),
      level: "guest",
    };
  },
  login(user) {
    const
    timeOfCreation = Date.now(),
    session = {
      ...user,
      loggedIn: true,
      timeOut: SESSION_TIMEOUT,
      timeOfCreation,
    },
    client = {
      loggedIn: true,
      timeOut: session.timeOut,
      timeOfCreation,
    };

    // client.timeOut = session.timeOut;
    if (session.username) client.username = session.username;
    if (session.email) client.email = session.email;

    return {session, client};
  },
  logout() {},
};

export default Session;
