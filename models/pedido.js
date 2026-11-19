"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class pedido extends Model {
    static associate(models) {
      pedido.belongsTo(models.usuario, {
        foreignKey: "usuarioid",
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      pedido.hasMany(models.pedidodetalle, {
        foreignKey: "pedidoid",
        as: "items",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  }
  pedido.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuarioid: { type: DataTypes.UUID, allowNull: true },
      total: { type: DataTypes.DECIMAL(24, 2), allowNull: false },
      estado: {
        type: DataTypes.ENUM("Confirmado"),
        allowNull: false,
        defaultValue: "Confirmado",
      },
    },
    { sequelize, freezeTableName: true, modelName: "pedido" },
  );
  return pedido;
};
