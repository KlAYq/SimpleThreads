"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, {foreignKey: "userId"});
      User.hasMany(models.Comment, {foreignKey: "userId"});
      User.hasMany(models.Follow, {foreignKey: "followingUserId", as: "Following"});
      User.hasMany(models.Follow, {foreignKey: "followedUserId", as : "Followed"});
      User.hasMany(models.Reaction, {foreignKey: "userId"});
      User.hasMany(models.Notification, {foreignKey: "userId"});
    }
  }

  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      fullName: DataTypes.STRING,
      profilePicture : DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
}
