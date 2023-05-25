"use strict";
const bcrypt = require("bcrypt");
require("dotenv").config();
/** @type {import('sequelize-cli').Migration} */
const { USER, PASSWORD, ROLE, USER1, PASSWORD1, ROLE1 } = process.env;
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
      {
        name: USER1.toUpperCase(),
        password: await bcrypt.hash(PASSWORD1, 12),
        role: parseInt(ROLE1),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("Users", null, {});
  },
};
