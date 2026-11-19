"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "carritoitem",
      {
        carritoid: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: { model: "carrito", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        productoid: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: { model: "producto", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        cantidad: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { engine: "InnoDB" },
    );
    await queryInterface.addConstraint("carritoitem", {
      fields: ["cantidad"],
      type: "check",
      where: { cantidad: { [Sequelize.Op.between]: [1, 999] } },
      name: "carritoitem_cantidad_rango",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("carritoitem");
  },
};
