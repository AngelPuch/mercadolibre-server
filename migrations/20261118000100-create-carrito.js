"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "carrito",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        usuarioid: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: { model: "usuario", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { engine: "InnoDB" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("carrito");
  },
};
