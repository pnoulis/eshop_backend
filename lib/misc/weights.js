export
const
weight = (weight, unit) => {
  switch (unit) {
  case "kg":
    return parseFloat(weight);
  case "gr":
    return parseFloat(weight / 1000);
  case "lt":
    return parseFloat(weight);
  default:
    return weight;
  }
};
