"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "pedido",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        usuarioid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: "usuario", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        total: { type: Sequelize.DECIMAL(24, 2), allowNull: false },
        estado: {
          type: Sequelize.ENUM("Confirmado"),
          allowNull: false,
          defaultValue: "Confirmado",
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { engine: "InnoDB" },
    );
    await queryInterface.addConstraint("pedido", {
      fields: ["total"],
      type: "check",
      where: { total: { [Sequelize.Op.gt]: 0 } },
      name: "pedido_total_positivo",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pedido");
  },
};
