require("dotenv").config();
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: "",
    database: "",
    host: "",
    dialect: "mysql",
  },
  production: {
    username: "",
    password: "",
    database: "",
    host: "",
    dialect: "mysql",
  },
};
