"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConfirmInstance extends Model {
  }

  ConfirmInstance.init(
    {
      confirmToken : DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "ConfirmInstance",
    }
  );

  return ConfirmInstance;
}
