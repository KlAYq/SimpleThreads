"use strict";
const { Model } = require("sequelize");
const {options} = require("pg/lib/defaults");
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models){
      Follow.belongsTo(models.User, {foreignKey: "followingUserId"});
      Follow.belongsTo(models.User, {foreignKey: "followedUserId"});
    }
  }

  Follow.init(
    {},
    {
      sequelize,
      modelName: "Follow",
    }
  );

  return Follow;
}
