import {EventEmitter} from "events";
import Session from "#session";

const
User = Object.create(new EventEmitter());
User.state = Session;

export default User;
