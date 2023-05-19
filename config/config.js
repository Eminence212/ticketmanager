require("dotenv").config();
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
  test: {
    username: "root",
    password: "",
    database: "",
    host: "",
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: "",
    password: "",
    database: "",
    host: "",
    dialect: "mysql",
    logging: false,
  },
};
