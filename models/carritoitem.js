"use strict";
const { Model } = require("sequelize");
const { MAX_CANTIDAD } = require("../config/carrito");

module.exports = (sequelize, DataTypes) => {
  class carritoitem extends Model {
    static associate(models) {
      carritoitem.belongsTo(models.carrito, {
        foreignKey: "carritoid",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
      carritoitem.belongsTo(models.producto, {
        foreignKey: "productoid",
        as: "producto",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  }
  carritoitem.init(
    {
      carritoid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      productoid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { isInt: true, min: 1, max: MAX_CANTIDAD },
      },
    },
    { sequelize, freezeTableName: true, modelName: "carritoitem" },
  );
  return carritoitem;
};
