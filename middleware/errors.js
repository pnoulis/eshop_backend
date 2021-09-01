export function handleError(err, req, res, next) {
  console.log(err);
  res.status(500).json({ok: false, error: {...err}});
}
