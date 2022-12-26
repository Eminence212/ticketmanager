const Cryptr = require("cryptr");
require("dotenv").config();
const cryptr = new Cryptr(process.env.CRYPTR_KEY);

export const criptString = (str) => {
  return cryptr.encrypt(str);
};
export const decriptString = (str) => {
  return cryptr.decrypt(str);
};
