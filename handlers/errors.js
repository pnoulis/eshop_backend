export function handleError(err, req, res, next) {
  console.log(err.name);
  console.log(err.message);
  console.log(err.stack);
  console.log(err.code);
  res.status(500).json({ok: false, err});
}
