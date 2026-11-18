const { categoria } = require("../models");
const self = {};

self.getAll = async function (req, res, next) {
  try {
    const data = await categoria.findAll({
      attributes: [["id", "categoriaId"], "nombre", "protegida"],
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

self.get = async function (req, res, next) {
  try {
    const data = await categoria.findByPk(req.params.id, {
      attributes: [["id", "categoriaId"], "nombre", "protegida"],
    });
    if (data) return res.status(200).json(data);
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

self.create = async function (req, res, next) {
  try {
    const data = await categoria.create({ nombre: req.body.nombre.trim() });
    await req.bitacora("categoria.crear", data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

self.update = async function (req, res, next) {
  try {
    const id = req.params.id;
    const existente = await categoria.findByPk(id);
    if (!existente) return res.status(404).send();
    await categoria.update(
      { nombre: req.body.nombre.trim() },
      { where: { id } },
    );
    await req.bitacora("categoria.editar", id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

self.delete = async function (req, res, next) {
  try {
    const id = req.params.id;
    let data = await categoria.findByPk(id);
    if (!data) return res.status(404).send();
    if (data.protegida) {
      return res
        .status(400)
        .json({ mensaje: "No se pueden eliminar categorías protegidas." });
    }
    data = await categoria.destroy({ where: { id } });
    if (data === 1) {
      await req.bitacora("categoria.eliminar", id);
      return res.status(204).send();
    }
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
