import fs from "fs";
import path from "path";
import slug from "slug";

const Paths = {
  mkLinuxCompliant(string) {
    const Options = {
      replacement: "_",
      remove: /\//, // remove forwared slashes
      lower: true,
    };

    return slug(string, Options);
  },
  extractName(string) { // client safe
    const isPath = string.lastIndexOf('/');
    return string.slice((isPath >= 0) ? isPath + 1 : 0 , string.lastIndexOf('.'));
  },
  extractExt(string) { // client safe
    return string.slice(string.lastIndexOf('.'), string.length);
  },
  extractNameExt(string) { // client safe
    const isPath = string.lastIndexOf('/');
    return string.slice((isPath >= 0) ? isPath + 1 : 0, string.length);
  },
  strToDir(type, ...strings) {
    if (type === "relative")
      return path.join("./", ...strings, "/");
    else
      return path.join("/", ...strings, "/");
  },
  createDir(dirPath, cb) {
    fs.mkdir(dirPath, cb);
  },
  removeDir(dirPath, cb) {
    fs.rm(dirPath, {force: true, recursive: true}, cb);
  },
  fileExists(dirPath, cb) {
    // fs.constants.f_OK is default as the the second parameter
    // to fs.access, check documentation
    // fs.access returns error for anything other than the case that
    // satisifyes the parameters. in this case if the file exists
    fs.access(dirPath, cb);
  },
};
export default Paths;
