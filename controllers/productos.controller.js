const { producto, categoria, Sequelize } = require("../models");
const { body, validationResult } = require("express-validator");
const Op = Sequelize.Op;
const self = {};

self.productoValidator = [
  body("titulo", "El campo {0} es obligatorio").not().isEmpty(),
  body("descripcion", "El campo {0} es obligatorio").not().isEmpty(),
  body("precio", "El campo {0} es obligatorio")
    .not()
    .isEmpty()
    .isDecimal({ force_decimal: false }),
];

self.getAll = async function (req, res, next) {
  try {
    const { s } = req.query;
    const filters = {};
    if (s) filters.titulo = { [Op.like]: `%${s}%` };
    const data = await producto.findAll({
      where: filters,
      attributes: [
        ["id", "productoId"],
        "titulo",
        "descripcion",
        "precio",
        "archivoid",
      ],
      include: {
        model: categoria,
        as: "categorias",
        attributes: [["id", "categoriaId"], "nombre", "protegida"],
        through: { attributes: [] },
      },
      subQuery: false,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

self.get = async function (req, res, next) {
  try {
    const data = await producto.findByPk(req.params.id, {
      attributes: [
        ["id", "productoId"],
        "titulo",
        "descripcion",
        "precio",
        "archivoid",
      ],
      include: {
        model: categoria,
        as: "categorias",
        attributes: [["id", "categoriaId"], "nombre", "protegida"],
        through: { attributes: [] },
      },
    });
    if (data) return res.status(200).json(data);
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

self.create = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));
    const data = await producto.create({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      archivoid: req.body.archivoid || null,
    });
    await req.bitacora("producto.crear", data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

self.update = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));
    const id = req.params.id;
    const data = await producto.update(req.body, { where: { id } });
    if (data[0] === 0) return res.status(404).send();
    await req.bitacora("producto.editar", id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

self.delete = async function (req, res, next) {
  try {
    const id = req.params.id;
    let data = await producto.findByPk(id);
    if (!data) return res.status(404).send();
    data = await producto.destroy({ where: { id } });
    if (data === 1) {
      await req.bitacora("producto.eliminar", id);
      return res.status(204).send();
    }
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

self.asignaCategoria = async function (req, res, next) {
  try {
    const itemToAssign = await categoria.findByPk(req.body.categoriaid);
    if (!itemToAssign) return res.status(404).send();
    const item = await producto.findByPk(req.params.id);
    if (!item) return res.status(404).send();
    await item.addCategoria(itemToAssign);
    await req.bitacora(
      "productocategoria.agregar",
      `${req.params.id}:${req.body.categoriaid}`,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

self.eliminaCategoria = async function (req, res, next) {
  try {
    const itemToRemove = await categoria.findByPk(req.params.categoriaid);
    if (!itemToRemove) return res.status(404).send();
    const item = await producto.findByPk(req.params.id);
    if (!item) return res.status(404).send();
    await item.removeCategoria(itemToRemove);
    await req.bitacora(
      "productocategoria.remover",
      `${req.params.id}:${req.params.categoriaid}`,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
