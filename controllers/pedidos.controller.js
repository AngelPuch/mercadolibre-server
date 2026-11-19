const {
  carrito,
  carritoitem,
  producto,
  pedido,
  pedidodetalle,
  sequelize,
} = require("../models");
const { MAX_CANTIDAD } = require("../config/carrito");
const { bloquearPropietario } = require("../services/carrito.service");
const {
  precioEnCentavos,
  formatearImporte,
} = require("../services/importes.service");
const self = {};

const conflicto = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 409;
  return error;
};

self.create = async function (req, res, next) {
  try {
    const resultado = await sequelize.transaction(async (transaction) => {
      const usuarioid = req.decodedToken.sub;
      await bloquearPropietario(usuarioid, transaction);
      const actual = await carrito.findOne({
        where: { usuarioid },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!actual) throw conflicto("El carrito está vacío.");

      const articulos = await carritoitem.findAll({
        where: { carritoid: actual.id },
        order: [["productoid", "ASC"]],
        transaction,
      });
      if (articulos.length === 0) throw conflicto("El carrito está vacío.");

      const productos = await producto.findAll({
        where: { id: articulos.map((item) => item.productoid) },
        attributes: ["id", "titulo", "precio"],
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.SHARE,
      });
      if (productos.length !== articulos.length) {
        throw conflicto(
          "El carrito contiene productos que ya no están disponibles.",
        );
      }

      const porId = new Map(productos.map((item) => [item.id, item]));
      let totalCentavos = 0n;
      const items = articulos.map((item) => {
        if (
          !Number.isInteger(item.cantidad) ||
          item.cantidad < 1 ||
          item.cantidad > MAX_CANTIDAD
        ) {
          throw conflicto("El carrito contiene una cantidad no válida.");
        }
        const actualProducto = porId.get(item.productoid);
        const precio = precioEnCentavos(actualProducto.precio);
        if (precio <= 0n) {
          throw conflicto("Uno de los productos no tiene un precio válido.");
        }
        const subtotal = precio * BigInt(item.cantidad);
        totalCentavos += subtotal;
        return {
          productoId: item.productoid,
          titulo: actualProducto.titulo,
          cantidad: item.cantidad,
          precioUnitario: formatearImporte(precio),
          subtotal: formatearImporte(subtotal),
        };
      });

      const nuevo = await pedido.create(
        { usuarioid, total: formatearImporte(totalCentavos) },
        { transaction },
      );
      await pedidodetalle.bulkCreate(
        items.map((item) => ({
          pedidoid: nuevo.id,
          productoid: item.productoId,
          cantidad: item.cantidad,
          preciounitario: item.precioUnitario,
          subtotal: item.subtotal,
        })),
        { transaction, validate: true },
      );
      await carritoitem.destroy({
        where: { carritoid: actual.id },
        transaction,
      });
      await req.bitacora("pedido.confirmar", nuevo.id, { transaction });
      return {
        pedidoId: nuevo.id,
        fecha: nuevo.createdAt,
        estado: nuevo.estado,
        total: nuevo.total,
        items,
      };
    });
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = self;
