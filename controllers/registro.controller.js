const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { usuario, rol, Sequelize } = require("../models");
const self = {};

self.create = async function (req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    const existente = await usuario.findOne({
      where: { email },
      attributes: ["id"],
      logging: false,
    });
    if (existente) {
      const error = new Error("Correo duplicado en registro público.");
      error.statusCode = 409;
      return next(error);
    }

    const rolUsuario = await rol.findOne({
      where: { nombre: "Usuario" },
      attributes: ["id", "nombre"],
      logging: false,
    });
    if (!rolUsuario) {
      const error = new Error("Registro público no disponible.");
      error.statusCode = 503;
      return next(error);
    }

    const data = await usuario.create(
      {
        id: crypto.randomUUID(),
        nombre,
        email,
        passwordhash: await bcrypt.hash(password, 10),
        rolid: rolUsuario.id,
        protegido: false,
      },
      { logging: false },
    );
    await req.bitacora("usuario.registro", data.id);
    res.status(201).json({
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: rolUsuario.nombre,
    });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      error.statusCode = 409;
    }
    next(error);
  }
};

module.exports = self;
