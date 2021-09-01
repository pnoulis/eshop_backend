import {Mongoose} from "#databases";

export {Tags};

const tags = [
  {
    tag: "fish",
    class: "main",
  },
  {
    tag: "meat",
    class: "main",
  },
  {
    tag: "vegetables",
    class: "main",
  },
  {
    tag: "liquid",
    class: "secondary",
  },
];

const
MONGOOSE_MODEL = "tags",
Tags = {
  getAll(cb) {
    return cb(null, tags);
  }
};
