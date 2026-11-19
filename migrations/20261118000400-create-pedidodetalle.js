"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "pedidodetalle",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        pedidoid: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "pedido", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        productoid: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "producto", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        cantidad: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        preciounitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        subtotal: { type: Sequelize.DECIMAL(24, 2), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { engine: "InnoDB" },
    );
    await queryInterface.addConstraint("pedidodetalle", {
      fields: ["pedidoid", "productoid"],
      type: "unique",
      name: "pedidodetalle_pedido_producto_unico",
    });
    await queryInterface.addConstraint("pedidodetalle", {
      fields: ["cantidad"],
      type: "check",
      where: { cantidad: { [Sequelize.Op.between]: [1, 999] } },
      name: "pedidodetalle_cantidad_rango",
    });
    await queryInterface.addConstraint("pedidodetalle", {
      fields: ["preciounitario"],
      type: "check",
      where: { preciounitario: { [Sequelize.Op.gt]: 0 } },
      name: "pedidodetalle_precio_positivo",
    });
    await queryInterface.addConstraint("pedidodetalle", {
      fields: ["subtotal"],
      type: "check",
      where: Sequelize.literal("subtotal = cantidad * preciounitario"),
      name: "pedidodetalle_subtotal_exacto",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pedidodetalle");
  },
};
