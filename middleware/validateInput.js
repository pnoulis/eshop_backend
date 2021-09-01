import valInput from "#input";

export {validateInput};
function validateInput(req, res, next) {
  let fieldErrors = {};

  for (let field in req.body) {
    fieldErrors[field] = valInput(field, req.body[field]);
  }

  if (req.body.confirmPassword &&
      (req.body.confirmPassword !== req.body.password)) {
    fieldErrors.confirmPassword = "passwords do not match!";
  }

  if (Object.values(fieldErrors).some(el => el)) return res.json({
    ok: false,
    payload: {fieldErrors},
  });

  return next();
}
