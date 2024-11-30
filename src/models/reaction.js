"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    static associate(models){
      Reaction.belongsTo(models.User, {foreignKey: "userId"});
      Reaction.belongsTo(models.Post, {foreignKey: "postId"});
    }
  }

  Reaction.init(
    {
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Reaction",
    }
  );

  return Reaction;
}
