"use strict";
const bcrypt = require("bcrypt");
require("dotenv").config();
/** @type {import('sequelize-cli').Migration} */
const { USER, PASSWORD, ROLE } = process.env;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", [
      {
        name: USER.toUpperCase(),
        password: await bcrypt.hash(PASSWORD, 12),
        role: parseInt(ROLE),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("Users", null, {});
  },
};
