const { archivo } = require("../models");
const fs = require("fs");
const self = {};

self.getAll = async function (req, res, next) {
  try {
    const data = await archivo.findAll({
      attributes: [["id", "archivoId"], "mime", "indb", "nombre", "size"],
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

self.getDetalle = async function (req, res, next) {
  try {
    const data = await archivo.findByPk(req.params.id, {
      attributes: [["id", "archivoId"], "mime", "indb", "nombre", "size"],
    });
    if (data) return res.status(200).json(data);
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

self.get = async function (req, res, next) {
  try {
    const data = await archivo.findByPk(req.params.id);
    if (!data) return res.status(404).send();
    let imagen = data.datos;
    if (!data.indb) imagen = fs.readFileSync("uploads/" + data.nombre);
    res.status(200).contentType(data.mime).send(imagen);
  } catch (error) {
    next(error);
  }
};

self.create = async function (req, res, next) {
  try {
    if (req.file === undefined)
      return res.status(400).json("El archivo es obligatorio.");
    let binario = null;
    let indb = false;
    if (process.env.FILES_IN_BD === "true") {
      binario = fs.readFileSync("uploads/" + req.file.filename);
      fs.existsSync("uploads/" + req.file.filename) &&
        fs.unlinkSync("uploads/" + req.file.filename);
      indb = true;
    }
    const data = await archivo.create({
      mime: req.file.mimetype,
      indb,
      nombre: req.file.filename,
      size: req.file.size,
      datos: binario,
    });
    await req.bitacora("archivos.crear", data.id);
    res
      .status(201)
      .json({
        id: data.id,
        mime: req.file.mimetype,
        indb,
        nombre: req.file.filename,
      });
  } catch (error) {
    next(error);
  }
};

self.update = async function (req, res, next) {
  try {
    if (req.file === undefined)
      return res.status(400).json("El archivo es obligatorio.");
    const id = req.params.id;
    const imagen = await archivo.findByPk(id);
    if (!imagen) {
      fs.existsSync("uploads/" + req.file.filename) &&
        fs.unlinkSync("uploads/" + req.file.filename);
      return res.status(404).send();
    }
    let binario = null;
    let indb = false;
    if (process.env.FILES_IN_BD === "true") {
      binario = fs.readFileSync("uploads/" + req.file.filename);
      fs.existsSync("uploads/" + req.file.filename) &&
        fs.unlinkSync("uploads/" + req.file.filename);
      indb = true;
    }
    const data = await archivo.update(
      {
        mime: req.file.mimetype,
        indb,
        nombre: req.file.filename,
        size: req.file.size,
        datos: binario,
      },
      { where: { id } },
    );
    if (data[0] === 0) return res.status(404).send();
    await req.bitacora("archivos.editar", id);
    if (!imagen.indb)
      fs.existsSync("uploads/" + imagen.nombre) &&
        fs.unlinkSync("uploads/" + imagen.nombre);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

self.delete = async function (req, res, next) {
  try {
    const id = req.params.id;
    const imagen = await archivo.findByPk(id);
    if (!imagen) return res.status(404).send();
    const data = await archivo.destroy({ where: { id } });
    if (data === 1) {
      await req.bitacora("archivos.eliminar", id);
      if (!imagen.indb)
        fs.existsSync("uploads/" + imagen.nombre) &&
          fs.unlinkSync("uploads/" + imagen.nombre);
      return res.status(204).send();
    }
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
