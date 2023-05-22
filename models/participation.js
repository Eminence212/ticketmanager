"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Participation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Participation.belongsTo(models.Evenement, {
        foreignKey: "evenementId",
      });
      Participation.belongsTo(models.Participant, {
        foreignKey: "participantId",
      });
      Participation.belongsTo(models.Place, {
        foreignKey: "placeId",
      });
    }
  }
  Participation.init(
    {
      presence: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      nombre: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 1,
      },
      evenementId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      participantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      placeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Participation",
    }
  );
  return Participation;
};
