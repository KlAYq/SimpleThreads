"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ResetInstance extends Model {
    static associate(models){
      ResetInstance.belongsTo(models.User, {foreignKey: "userId"});
    }
  }

  ResetInstance.init(
    {
      resetToken : DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ResetInstance",
    }
  );

  return ResetInstance;
}
