import {Tags} from "#lib/tags.js";
import log from "#log";

export const TAG_HANDLERS = {
  read(req, res, next) {
    Tags.getAll((err, tags) => {
      res.json({ok: true, payload: tags});
    });
  }
};
