import fs from "fs";
import path from "path";
import slug from "slug";
import config from "#config";

function Path(string) {
  this.path = string;
  return this;
};

Path.prototype.mkLinuxCompliant = function() {
  const Options = {
    replacement: "_",
    remove: /\//, // remove forwared slashes
    lower: true,
  };

  this.path = slug(this.path, Options);
  return this;
};

Path.prototype.removeDomain = function() {
  console.log(this.path);
  this.path = this.path.substring(this.path.match(config.serverDomain)[0].length + 1);
  return this;
};
Path.prototype.removeFile = function() {
  this.path = this.path.substring(0, this.path.lastIndexOf('/'));
  return this;
};
Path.prototype.addPublic = function() {
  this.path = "." + config.publicDir.concat("/", this.path);
  return this;
};
Path.prototype.extractName = function() {
  const isPath = this.path.lastIndexOf('/');
  this.path = this.path.slice((isPath >= 0) ? isPath + 1 : 0 , this.path.lastIndexOf('.'));
  return this;
};

Path.prototype.extractExt = function() {
  this.path = this.path.slice(this.path.lastIndexOf('.'), this.path.length);
  return this;
};
Path.prototype.extractNameExt = function() {
  const isPath = this.path.lastIndexOf('/');
  this.path = this.path.slice((isPath >= 0) ? isPath + 1 : 0, this.path.length);
  return this;
};
Path.prototype.strToDir = function(type, ...strings) {
  if (type === "relative") {
    this.path = path.join("./", ...strings, this.path, "/");
  } else {
    this.path = path.join("/", ...strings, this.path, "/");
  }
  return this;
};
Path.prototype.get = function() {
  return this.path;
};
Path.prototype.createDir = function(dirPath, cb) {
  fs.mkdir(dirPath || this.path, cb);
};
Path.prototype.removeDir = function(dirPath, cb) {
  fs.rm(dirPath || this.path, {recursive: true}, cb);
};
Path.prototype.fileExists = function(dirPath, cb) {
  // fs.constants.f_OK is default as the the second parameter
  // to fs.access, check documentation
  // fs.access returns error for anything other than the case that
  // satisifyes the parameters. in this case if the file exists
  fs.access(dirPath || this.path, cb);
};
export default Path;
