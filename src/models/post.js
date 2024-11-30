"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models){
      Post.belongsTo(models.User, {foreignKey: "userId"});
      Post.hasMany(models.Comment, {foreignKey: "postId"});
      Post.hasMany(models.Reaction, {foreignKey: "postId"})
    }
  }

  Post.init(
    {
      description: DataTypes.STRING,
      image: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Post",
    }
  );

  return Post;
}
