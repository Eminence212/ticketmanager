"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Customers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique:true
      },
      inbound: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      inbound_amp: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      outbound: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      outbound_amp: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      erreur: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      erreur_amp: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      archive: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      archive_amp: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      autovalidation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      host: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      port: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      response_slug: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Customers");
  },
};
