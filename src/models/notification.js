"use strict";
const { Model } = require("sequelize");
const {options} = require("pg/lib/defaults");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models){
      Notification.belongsTo(models.User, {foreignKey: "userId", as: "owner"});
      Notification.belongsTo(models.Post, {foreignKey: "postId"});
      Notification.belongsTo(models.User, {foreignKey: "otherId", as: "other"});
    }
  }

  Notification.init(
    {
      content: DataTypes.STRING,
      isRead: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );

  return Notification;
}
