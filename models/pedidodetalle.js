"use strict";
const { Model } = require("sequelize");
const { MAX_CANTIDAD } = require("../config/carrito");

module.exports = (sequelize, DataTypes) => {
  class pedidodetalle extends Model {
    static associate(models) {
      pedidodetalle.belongsTo(models.pedido, {
        foreignKey: "pedidoid",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
      pedidodetalle.belongsTo(models.producto, {
        foreignKey: "productoid",
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  }
  pedidodetalle.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pedidoid: { type: DataTypes.INTEGER, allowNull: false },
      productoid: { type: DataTypes.INTEGER, allowNull: true },
      cantidad: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { isInt: true, min: 1, max: MAX_CANTIDAD },
      },
      preciounitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: DataTypes.DECIMAL(24, 2), allowNull: false },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "pedidodetalle",
      indexes: [
        {
          unique: true,
          fields: ["pedidoid", "productoid"],
          name: "pedidodetalle_pedido_producto_unico",
        },
      ],
    },
  );
  return pedidodetalle;
};
