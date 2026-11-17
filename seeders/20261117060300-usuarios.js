"use strict";
const bcrypt = require("bcrypt");
const crypto = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    const AdministradorUUID = crypto.randomUUID();
    const UsuarioUUID = crypto.randomUUID();
    await queryInterface.bulkInsert("rol", [
      {
        id: AdministradorUUID,
        nombre: "Administrador",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: UsuarioUUID,
        nombre: "Usuario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("usuario", [
      {
        id: crypto.randomUUID(),
        email: "puchhernandeza@gmail.com",
        passwordhash: await bcrypt.hash("patito", 10),
        nombre: "Angel Puch",
        rolid: AdministradorUUID,
        protegido: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        email: "patito@uv.mx",
        passwordhash: await bcrypt.hash("patito", 10),
        nombre: "Usuario patito",
        rolid: UsuarioUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuario", null, {});
    await queryInterface.bulkDelete("rol", null, {});
  },
};
