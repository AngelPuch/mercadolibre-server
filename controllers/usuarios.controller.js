const { usuario, rol, Sequelize } = require("../models");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const self = {};

self.getAll = async function (req, res, next) {
  try {
    const data = await usuario.findAll({
      raw: true,
      attributes: [
        "id",
        "email",
        "nombre",
        [Sequelize.col("rol.nombre"), "rol"],
      ],
      include: { model: rol, attributes: [] },
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

self.get = async function (req, res, next) {
  try {
    const data = await usuario.findOne({
      where: { email: req.params.email },
      raw: true,
      attributes: [
        "id",
        "email",
        "nombre",
        [Sequelize.col("rol.nombre"), "rol"],
      ],
      include: { model: rol, attributes: [] },
    });
    if (data) return res.status(200).json(data);
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

self.create = async function (req, res, next) {
  try {
    const rolusuario = await rol.findOne({ where: { nombre: req.body.rol } });
    if (!rolusuario) return res.status(400).send();
    const data = await usuario.create({
      id: crypto.randomUUID(),
      email: req.body.email,
      passwordhash: await bcrypt.hash(req.body.password, 10),
      nombre: req.body.nombre,
      rolid: rolusuario.id,
    });
    await req.bitacora("usuarios.crear", data.email);
    res
      .status(201)
      .json({
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rolid: rolusuario.nombre,
      });
  } catch (error) {
    next(error);
  }
};

self.update = async function (req, res, next) {
  try {
    const email = req.params.email;
    const rolusuario = await rol.findOne({ where: { nombre: req.body.rol } });
    if (!rolusuario) return res.status(400).send();
    req.body.rolid = rolusuario.id;
    if (req.body.password !== undefined)
      req.body.passwordhash = await bcrypt.hash(req.body.password, 10);
    const data = await usuario.update(req.body, { where: { email } });
    if (data[0] === 0) return res.status(404).send();
    await req.bitacora("usuarios.editar", email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

self.delete = async function (req, res, next) {
  try {
    const email = req.params.email;
    let data = await usuario.findOne({ where: { email } });
    if (!data) return res.status(404).send();
    if (data.protegido) return res.status(403).send();
    data = await usuario.destroy({ where: { email } });
    if (data === 1) {
      await req.bitacora("usuarios.eliminar", email);
      return res.status(204).send();
    }
    res.status(403).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
