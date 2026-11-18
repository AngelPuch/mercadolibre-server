const { body } = require("express-validator");

const loginValidator = [
  body("email")
    .isString()
    .withMessage("El correo debe ser una cadena de texto.")
    .bail()
    .isEmail()
    .withMessage("El correo no tiene un formato válido."),
  body("password")
    .isString()
    .withMessage("La contraseña debe ser una cadena de texto.")
    .bail()
    .notEmpty()
    .withMessage("La contraseña es obligatoria."),
];

module.exports = { loginValidator };
