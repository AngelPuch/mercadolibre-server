const { body, query } = require("express-validator");

const confirmarPedidoValidator = [
  query()
    .hide()
    .custom((value) => Object.keys(value).length === 0)
    .withMessage("La confirmación no acepta parámetros de consulta.")
    .bail({ level: "request" }),
  body()
    .hide()
    .custom((value, { req }) => {
      if (value === undefined) {
        return (
          !req.get("Transfer-Encoding") &&
          !(Number(req.get("Content-Length")) > 0)
        );
      }
      return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      );
    })
    .withMessage("La confirmación no acepta campos en el cuerpo."),
];

module.exports = { confirmarPedidoValidator };
