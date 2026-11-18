"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    static associate(models) {
      usuario.belongsTo(models.rol, { foreignKey: "rolid" });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.passwordhash;
      delete values.password;
      return values;
    }
  }
  usuario.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      passwordhash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      protegido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rolid: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "usuario",
    },
  );
  return usuario;
};
