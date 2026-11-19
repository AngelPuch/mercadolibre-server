const { body, param, query } = require("express-validator");
const { MAX_CANTIDAD } = require("../config/carrito");

const sinQuery = query()
  .hide()
  .custom((value) => Object.keys(value).length === 0)
  .withMessage("No se permiten parámetros de consulta para el carrito.")
  .bail({ level: "request" });

const camposPermitidos = (campos) =>
  body()
    .hide()
    .custom((value) => {
      if (value === undefined) return campos.length === 0;
      return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).every((campo) => campos.includes(campo))
      );
    })
    .withMessage(
      campos.length
        ? `Solo se permiten los campos ${campos.join(", ")}.`
        : "Esta solicitud no acepta campos en el cuerpo.",
    )
    .bail({ level: "request" });

const enteroPositivo = (chain, max, mensaje) =>
  chain
    .hide()
    .custom((value) => typeof value === "number" || typeof value === "string")
    .withMessage(mensaje)
    .bail()
    .isInt({ min: 1, max })
    .withMessage(mensaje)
    .bail()
    .toInt();

const productoIdParam = enteroPositivo(
  param("productoId"),
  2147483647,
  "El productoId debe ser un entero positivo válido.",
);
const cantidad = enteroPositivo(
  body("cantidad"),
  MAX_CANTIDAD,
  `La cantidad es obligatoria y debe ser un entero entre 1 y ${MAX_CANTIDAD}.`,
);

const consultarValidator = [sinQuery, camposPermitidos([])];
const agregarValidator = [
  sinQuery,
  camposPermitidos(["productoId", "cantidad"]),
  enteroPositivo(
    body("productoId"),
    2147483647,
    "El productoId es obligatorio y debe ser un entero positivo válido.",
  ),
  cantidad,
];
const actualizarValidator = [
  sinQuery,
  camposPermitidos(["cantidad"]),
  productoIdParam,
  cantidad,
];
const eliminarValidator = [sinQuery, camposPermitidos([]), productoIdParam];

module.exports = {
  consultarValidator,
  agregarValidator,
  actualizarValidator,
  eliminarValidator,
};
