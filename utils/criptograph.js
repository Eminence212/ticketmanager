const base64 = require("base-64");
const criptString = (str) => {
  return base64.encode(str);
};
const decriptString = (str) => {
  return base64.decode(str);
};
module.exports = {
  criptString,
  decriptString,
};
