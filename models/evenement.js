"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Evenement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Evenement.belongsToMany(models.Participant, {
        foreignKey: "evenementId",
        through: "Participation",
      });
      Evenement.belongsToMany(models.Place, {
        foreignKey: "evenementId",
        through: "Participation",
      });
      Evenement.hasMany(models.Participation, {
        foreignKey: "evenementId",
      });
    }
  }
  Evenement.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true,
      },
      lieu: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Evenement",
    }
  );
  return Evenement;
};
