import config from "#config";

function extractFile(stack) {
  if (!stack) return null;
  try {
    let file = stack.match(/\(.*\)/i)[0];
    file = file.substring(file.indexOf(config.serverRoot));
    return file;
  } catch (err) {
    return null;
  }
}

export function formatErr(err) {
  return {
    ...err,
    name: err.name,
    message: err.message,
    code: err.code,
    file: extractFile(err.stack),
  };
}
