"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Customer.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  Customer.init(
    {
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      inbound: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      inbound_amp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      outbound: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      outbound_amp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      erreur: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      erreur_amp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      archive: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      archive_amp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      autovalidation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      host: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      port: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      response_slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Customer",
    }
  );
  return Customer;
};
