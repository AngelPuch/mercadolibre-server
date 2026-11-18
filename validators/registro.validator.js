const { body } = require("express-validator");
const { validarPoliticaPassword } = require("./usuarios.validator");

const camposPermitidos = ["nombre", "email", "password"];

const registroValidator = [
  body()
    .hide()
    .custom(
      (value) =>
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).every((campo) => camposPermitidos.includes(campo)),
    )
    .withMessage("Solo se permiten los campos nombre, email y password.")
    .bail({ level: "request" }),
  body("nombre")
    .hide()
    .isString()
    .withMessage("El nombre es obligatorio y debe ser una cadena de texto.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("El nombre debe tener entre 1 y 255 caracteres."),
  body("email")
    .hide()
    .isString()
    .withMessage("El correo es obligatorio y debe ser una cadena de texto.")
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("El correo no tiene un formato válido.")
    .isLength({ max: 255 })
    .withMessage("El correo no debe exceder 255 caracteres."),
  validarPoliticaPassword(body("password").hide())
    .bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("La contraseña no debe exceder 72 bytes en UTF-8."),
];

module.exports = { registroValidator };
