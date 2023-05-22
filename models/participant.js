"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Participant.belongsToMany(models.Evenement, {
        foreignKey: "participantId",
        through: "Participation",
      });
      Participant.belongsToMany(models.Place, {
        foreignKey: "participantId",
        through: "Participation",
      });
       Participant.hasMany(models.Participation, {
         foreignKey: "participantId",
       });
    }
  }
  Participant.init(
    {
      name: DataTypes.STRING,
      contact: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Participant",
    }
  );
  return Participant;
};
