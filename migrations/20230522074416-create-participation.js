"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Participations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      presence: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      nombre: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 1,
      },
      evenementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Evenement",
          key: "id",
        },
      },
      participantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Participant",
          key: "id",
        },
      },
      placeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Place",
          key: "id",
        },
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
    await queryInterface.dropTable("Participations");
  },
};
