import {expireIn} from "#misc/time.js";

export
const
SESSION_TIMEOUT = {expireIn: "30m"},
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
    session = {
      ...user,
      loggedIn: true,
      timeOut: expireIn(SESSION_TIMEOUT),
      timeOfCreation: new Date().toString(),
    },
    client = {
      loggedIn: true,
      timeOut: session.timeOut,
    };

    // client.timeOut = session.timeOut;
    if (session.username) client.username = session.username;
    if (session.email) client.uemail = session.email;

    return {session, client};
  },
  logout() {},
};

export default Session;
