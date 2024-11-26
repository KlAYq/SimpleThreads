"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models){
      Comment.belongsTo(models.User, {foreignKey: "userId"});
      Comment.belongsTo(models.Post, {foreignKey: "postId"});
    }
  }

  Comment.init(
    {
      content: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );

  return Comment;
}
