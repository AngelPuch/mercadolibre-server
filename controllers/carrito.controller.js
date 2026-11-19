const {
  carrito,
  carritoitem,
  producto,
  usuario,
  sequelize,
} = require("../models");
const { MAX_CANTIDAD } = require("../config/carrito");
const self = {};

const errorHttp = (statusCode, mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const obtenerCarritoParaEscritura = async (
  usuarioid,
  transaction,
  crear = false,
) => {
  const propietario = await usuario.findByPk(usuarioid, {
    attributes: ["id"],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!propietario) throw errorHttp(401, "Acceso denegado.");

  let actual = await carrito.findOne({ where: { usuarioid }, transaction });
  if (!actual && crear) {
    actual = await carrito.create({ usuarioid }, { transaction });
  }
  if (!actual) throw errorHttp(404, "El artículo no está en el carrito.");
  return actual;
};

const precioEnCentavos = (precio) => {
  const valor = String(precio);
  const [entero, fraccion = ""] = valor.replace(/^-/, "").split(".");
  const centavos = BigInt(entero) * 100n + BigInt(fraccion.padEnd(2, "0"));
  return valor.startsWith("-") ? -centavos : centavos;
};

const formatearImporte = (centavos) => {
  const absoluto = centavos < 0n ? -centavos : centavos;
  return `${centavos < 0n ? "-" : ""}${absoluto / 100n}.${String(absoluto % 100n).padStart(2, "0")}`;
};

self.get = async function (req, res, next) {
  try {
    const usuarioid = req.decodedToken.sub;
    const propietario = await usuario.findByPk(usuarioid, {
      attributes: ["id"],
    });
    if (!propietario) throw errorHttp(401, "Acceso denegado.");

    const actual = await carrito.findOne({
      where: { usuarioid },
      attributes: ["id"],
      include: {
        model: carritoitem,
        as: "items",
        attributes: ["productoid", "cantidad"],
        include: {
          model: producto,
          as: "producto",
          attributes: ["id", "titulo", "precio", "archivoid"],
          required: true,
        },
      },
      order: [[{ model: carritoitem, as: "items" }, "productoid", "ASC"]],
    });
    let subtotal = 0n;
    const items = (actual?.items || []).map((item) => {
      const precioUnitario = precioEnCentavos(item.producto.precio);
      const subtotalItem = precioUnitario * BigInt(item.cantidad);
      subtotal += subtotalItem;
      return {
        productoId: item.productoid,
        titulo: item.producto.titulo,
        archivoid: item.producto.archivoid,
        cantidad: item.cantidad,
        precioUnitario: formatearImporte(precioUnitario),
        subtotal: formatearImporte(subtotalItem),
      };
    });
    res.status(200).json({ items, subtotal: formatearImporte(subtotal) });
  } catch (error) {
    next(error);
  }
};

self.add = async function (req, res, next) {
  try {
    const { productoId, cantidad } = req.body;
    const resultado = await sequelize.transaction(async (transaction) => {
      const actual = await obtenerCarritoParaEscritura(
        req.decodedToken.sub,
        transaction,
        true,
      );
      const existente = await producto.findByPk(productoId, {
        attributes: ["id"],
        transaction,
        lock: transaction.LOCK.SHARE,
      });
      if (!existente) throw errorHttp(404, "El producto no existe.");

      const item = await carritoitem.findOne({
        where: { carritoid: actual.id, productoid: productoId },
        transaction,
      });
      const nuevaCantidad = (item?.cantidad || 0) + cantidad;
      if (nuevaCantidad > MAX_CANTIDAD) {
        throw errorHttp(
          409,
          `La cantidad acumulada no puede exceder ${MAX_CANTIDAD}.`,
        );
      }
      if (item) await item.update({ cantidad: nuevaCantidad }, { transaction });
      else {
        await carritoitem.create(
          {
            carritoid: actual.id,
            productoid: productoId,
            cantidad: nuevaCantidad,
          },
          { transaction },
        );
      }
      await req.bitacora("carrito.agregar", `${actual.id}:${productoId}`, {
        transaction,
      });
      return { creado: !item, cantidad: nuevaCantidad };
    });
    res
      .status(resultado.creado ? 201 : 200)
      .json({ productoId, cantidad: resultado.cantidad });
  } catch (error) {
    next(error);
  }
};

self.update = async function (req, res, next) {
  try {
    const { productoId } = req.params;
    await sequelize.transaction(async (transaction) => {
      const actual = await obtenerCarritoParaEscritura(
        req.decodedToken.sub,
        transaction,
      );
      const item = await carritoitem.findOne({
        where: { carritoid: actual.id, productoid: productoId },
        transaction,
      });
      if (!item) throw errorHttp(404, "El artículo no está en el carrito.");
      await item.update({ cantidad: req.body.cantidad }, { transaction });
      await req.bitacora("carrito.editar", `${actual.id}:${productoId}`, {
        transaction,
      });
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

self.delete = async function (req, res, next) {
  try {
    const { productoId } = req.params;
    await sequelize.transaction(async (transaction) => {
      const actual = await obtenerCarritoParaEscritura(
        req.decodedToken.sub,
        transaction,
      );
      const item = await carritoitem.findOne({
        where: { carritoid: actual.id, productoid: productoId },
        transaction,
      });
      if (!item) throw errorHttp(404, "El artículo no está en el carrito.");
      await item.destroy({ transaction });
      await req.bitacora("carrito.eliminar", `${actual.id}:${productoId}`, {
        transaction,
      });
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
