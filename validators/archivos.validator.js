const { param } = require("express-validator");

const idParamValidator = [
  param("id", "El identificador del archivo debe ser un entero positivo.")
    .isInt({ min: 1 })
    .toInt(),
];

module.exports = {
  idParamValidator,
};
