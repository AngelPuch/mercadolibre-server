"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class carrito extends Model {
    static associate(models) {
      carrito.belongsTo(models.usuario, {
        foreignKey: "usuarioid",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
      carrito.hasMany(models.carritoitem, {
        foreignKey: "carritoid",
        as: "items",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  }
  carrito.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuarioid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
    },
    { sequelize, freezeTableName: true, modelName: "carrito" },
  );
  return carrito;
};
