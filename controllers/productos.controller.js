const { producto, categoria, archivo, sequelize, Sequelize } = require("../models");
const Op = Sequelize.Op;
const self = {};

const extraerIdsCategorias = (categoriasInput) => {
  if (!Array.isArray(categoriasInput)) return null;
  return [
    ...new Set(
      categoriasInput.map((item) =>
        Number(
          typeof item === "object" && item !== null
            ? (item.categoriaId ?? item.categoriaid ?? item.id)
            : item,
        ),
      ),
    ),
  ];
};

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
    const archivoid =
      req.body.archivoid !== undefined &&
      req.body.archivoid !== null &&
      req.body.archivoid !== ""
        ? Number(req.body.archivoid)
        : null;
    if (archivoid !== null) {
      const archivoExistente = await archivo.findByPk(archivoid);
      if (!archivoExistente) {
        return res
          .status(400)
          .json({ mensaje: "El archivo especificado no existe." });
      }
    }

    let categoriasEncontradas = null;
    const idsCategorias = extraerIdsCategorias(req.body.categorias);
    if (idsCategorias !== null && idsCategorias.length > 0) {
      categoriasEncontradas = await categoria.findAll({
        where: { id: idsCategorias },
      });
      if (categoriasEncontradas.length !== idsCategorias.length) {
        return res.status(400).json({
          mensaje: "Una o más categorías especificadas no existen.",
        });
      }
    }

    const data = await sequelize.transaction(async (transaction) => {
      const nuevo = await producto.create(
        {
          titulo: req.body.titulo.trim(),
          descripcion: req.body.descripcion.trim(),
          precio: req.body.precio,
          archivoid,
        },
        { transaction },
      );
      if (categoriasEncontradas !== null) {
        await nuevo.setCategorias(categoriasEncontradas, { transaction });
      }
      return nuevo;
    });
   
    await req.bitacora("producto.crear", data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

self.update = async function (req, res, next) {
  try {
    const id = req.params.id;
    const item = await producto.findByPk(id);
    if (!item) return res.status(404).send();

    const archivoid =
      req.body.archivoid !== undefined &&
      req.body.archivoid !== null &&
      req.body.archivoid !== ""
        ? Number(req.body.archivoid)
        : null;
    if (archivoid !== null) {
      const archivoExistente = await archivo.findByPk(archivoid);
      if (!archivoExistente) {
        return res
          .status(400)
          .json({ mensaje: "El archivo especificado no existe." });
      }
    }

    let categoriasEncontradas = null;
    const idsCategorias = extraerIdsCategorias(req.body.categorias);
    if (idsCategorias !== null) {
      if (idsCategorias.length > 0) {
        categoriasEncontradas = await categoria.findAll({
          where: { id: idsCategorias },
        });
        if (categoriasEncontradas.length !== idsCategorias.length) {
          return res.status(400).json({
            mensaje: "Una o más categorías especificadas no existen.",
          });
        }
      } else {
        categoriasEncontradas = [];
      }
    }

    const camposActualizar = {
      titulo: req.body.titulo.trim(),
      descripcion: req.body.descripcion.trim(),
      precio: req.body.precio,
    };
    if (req.body.archivoid !== undefined) {
      camposActualizar.archivoid = archivoid;
    }

    await sequelize.transaction(async (transaction) => {
      await producto.update(camposActualizar, { where: { id }, transaction });
      if (categoriasEncontradas !== null) {
        await item.setCategorias(categoriasEncontradas, { transaction });
      }
    });
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
