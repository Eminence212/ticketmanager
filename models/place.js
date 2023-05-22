"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Place extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Place.belongsToMany(models.Evenement, {
        foreignKey: "placeId",
        through: "Participation",
      });
      Place.belongsToMany(models.Participant, {
        foreignKey: "placeId",
        through: "Participation",
      });
      Place.belongsTo(models.Participation, {
        foreignKey: "placeId",
      });
    }
  }
  Place.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      capacite: {
        type: DataTypes.INTEGER(2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Place",
    }
  );
  return Place;
};
