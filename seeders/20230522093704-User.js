"use strict";
const bcrypt = require("bcrypt");
require("dotenv").config();
/** @type {import('sequelize-cli').Migration} */
const { USER1, PASSWORD1, ROLE1, USER2, PASSWORD2, ROLE2 } = process.env;
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Users", [
      {
        name: USER1.toUpperCase(),
        password: await bcrypt.hash(PASSWORD1, 12),
        role: parseInt(ROLE1),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: USER2.toUpperCase(),
        password: await bcrypt.hash(PASSWORD2, 12),
        role: parseInt(ROLE2),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
