const { body, param } = require("express-validator");

const idParamValidator = [
  param("id", "El identificador de la categoría debe ser un entero positivo.")
    .isInt({ min: 1 })
    .toInt(),
];

const categoriaValidator = [
  body("nombre", "El campo nombre es obligatorio.")
    .isString()
    .withMessage("El campo nombre debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo nombre es obligatorio.")
    .isLength({ min: 1, max: 255 })
    .withMessage("El campo nombre debe tener entre 1 y 255 caracteres."),
  body().custom((_, { req }) => {
    if (req.params && req.params.id !== undefined) {
      const bodyId = req.body.categoriaId ?? req.body.categoriaid;
      if (
        bodyId !== undefined &&
        bodyId !== null &&
        Number(bodyId) !== Number(req.params.id)
      ) {
        throw new Error(
          "El identificador del cuerpo no coincide con el de la ruta.",
        );
      }
    }
    return true;
  }),
];

module.exports = {
  idParamValidator,
  categoriaValidator,
};
