const { body, param } = require("express-validator");

const validarPoliticaPassword = (chain) =>
  chain
    .isString()
    .withMessage("La contraseña debe ser una cadena de texto.")
    .isLength({ min: 8, max: 128 })
    .withMessage("La contraseña debe tener entre 8 y 128 caracteres.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "La contraseña debe tener mínimo 8 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales.",
    );

const emailParamValidator = [
  param("email", "El parámetro email no tiene un formato de correo válido.")
    .trim()
    .notEmpty()
    .withMessage("El parámetro email es obligatorio.")
    .isEmail()
    .withMessage("El parámetro email no tiene un formato de correo válido.")
    .isLength({ max: 255 })
    .withMessage("El parámetro email no debe exceder 255 caracteres."),
];

const usuarioCreateValidator = [
  body("email", "El campo email es obligatorio y debe ser un correo válido.")
    .isString()
    .withMessage("El campo email debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo email es obligatorio.")
    .isEmail()
    .withMessage("El campo email no tiene un formato de correo válido.")
    .isLength({ max: 255 })
    .withMessage("El campo email no debe exceder 255 caracteres."),
  validarPoliticaPassword(
    body("password", "El campo password es obligatorio.")
      .notEmpty()
      .withMessage("El campo password es obligatorio."),
  ),
  body("nombre", "El campo nombre es obligatorio.")
    .isString()
    .withMessage("El campo nombre debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo nombre es obligatorio.")
    .isLength({ min: 1, max: 255 })
    .withMessage("El campo nombre debe tener entre 1 y 255 caracteres."),
  body("rol", "El campo rol es obligatorio.")
    .isString()
    .withMessage("El campo rol debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo rol es obligatorio.")
    .isLength({ min: 1, max: 255 })
    .withMessage("El campo rol debe tener entre 1 y 255 caracteres."),
  body("passwordhash")
    .not()
    .exists()
    .withMessage("No se permite enviar el campo passwordhash."),
];

const usuarioUpdateValidator = [
  ...emailParamValidator,
  body("email")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("El campo email debe ser una cadena de texto.")
    .trim()
    .isEmail()
    .withMessage("El campo email no tiene un formato de correo válido.")
    .isLength({ max: 255 })
    .withMessage("El campo email no debe exceder 255 caracteres.")
    .custom((val, { req }) => {
      if (
        req.params &&
        req.params.email &&
        val.trim().toLowerCase() !== req.params.email.trim().toLowerCase()
      ) {
        throw new Error(
          "El correo del cuerpo no coincide con el de la ruta.",
        );
      }
      return true;
    }),
  body("nombre", "El campo nombre es obligatorio.")
    .isString()
    .withMessage("El campo nombre debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo nombre es obligatorio.")
    .isLength({ min: 1, max: 255 })
    .withMessage("El campo nombre debe tener entre 1 y 255 caracteres."),
  body("rol", "El campo rol es obligatorio.")
    .isString()
    .withMessage("El campo rol debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo rol es obligatorio.")
    .isLength({ min: 1, max: 255 })
    .withMessage("El campo rol debe tener entre 1 y 255 caracteres."),
  validarPoliticaPassword(body("password").optional({ values: "undefined" })),
  body("passwordhash")
    .not()
    .exists()
    .withMessage("No se permite enviar el campo passwordhash."),
];

module.exports = {
  validarPoliticaPassword,
  emailParamValidator,
  usuarioCreateValidator,
  usuarioUpdateValidator,
};
