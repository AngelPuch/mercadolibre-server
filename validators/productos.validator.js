const { body, param, query } = require("express-validator");

const searchValidator = [
  query("s")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("El parámetro de búsqueda debe ser una cadena de texto.")
    .trim()
    .isLength({ max: 255 })
    .withMessage("El parámetro de búsqueda no puede exceder 255 caracteres."),
];

const idParamValidator = [
  param("id", "El identificador del producto debe ser un entero positivo.")
    .isInt({ min: 1 })
    .toInt(),
];

const productoValidator = [
  body("titulo", "El campo titulo es obligatorio.")
    .isString()
    .withMessage("El campo titulo debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo titulo es obligatorio.")
    .isLength({ min: 1, max: 255 })
    .withMessage("El campo titulo debe tener entre 1 y 255 caracteres."),
  body("descripcion", "El campo descripcion es obligatorio.")
    .isString()
    .withMessage("El campo descripcion debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El campo descripcion es obligatorio.")
    .isLength({ min: 1, max: 4000 })
    .withMessage("El campo descripcion debe tener entre 1 y 4000 caracteres."),
  body("precio", "El campo precio es obligatorio.")
    .notEmpty()
    .withMessage("El campo precio es obligatorio.")
    .custom((val) => typeof val === "number" || typeof val === "string")
    .withMessage("El campo precio debe ser un valor numérico.")
    .isDecimal({ force_decimal: false, decimal_digits: "0,2" })
    .withMessage(
      "El campo precio debe ser un número válido con hasta 2 decimales.",
    )
    .isFloat({ gt: 0, max: 99999999.99 })
    .withMessage("El campo precio debe ser un número positivo mayor a 0."),
  body("archivoid")
    .optional({ values: "null" })
    .custom(
      (val) =>
        val === "" ||
        (typeof val !== "boolean" &&
          !Array.isArray(val) &&
          Number.isInteger(Number(val)) &&
          Number(val) >= 1),
    )
    .withMessage("El campo archivoid debe ser un entero positivo."),
  body("categorias")
    .optional({ values: "null" })
    .isArray()
    .withMessage("El campo categorias debe ser un arreglo.")
    .custom((arr) =>
      arr.every((item) => {
        const id =
          typeof item === "object" && item !== null
            ? (item.categoriaId ?? item.categoriaid ?? item.id)
            : item;
        return (
          (typeof id === "number" || typeof id === "string") &&
          String(id).trim() !== "" &&
          Number.isInteger(Number(id)) &&
          Number(id) >= 1
        );
      }),
    )
    .withMessage(
      "Cada categoría debe tener un identificador entero positivo válido.",
    ),
  body().custom((_, { req }) => {
    if (req.params && req.params.id !== undefined) {
      const bodyId = req.body.productoId ?? req.body.productoid;
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

const asignaCategoriaValidator = [
  param("id", "El identificador del producto debe ser un entero positivo.")
    .isInt({ min: 1 })
    .toInt(),
  body("categoriaid", "El campo categoriaid es obligatorio.")
    .notEmpty()
    .withMessage("El campo categoriaid es obligatorio.")
    .custom((val) => typeof val === "number" || typeof val === "string")
    .withMessage("El campo categoriaid debe ser un entero positivo.")
    .isInt({ min: 1 })
    .withMessage("El campo categoriaid debe ser un entero positivo.")
    .toInt(),
];

const eliminaCategoriaValidator = [
  param("id", "El identificador del producto debe ser un entero positivo.")
    .isInt({ min: 1 })
    .toInt(),
  param(
    "categoriaid",
    "El identificador de la categoría debe ser un entero positivo.",
  )
    .isInt({ min: 1 })
    .toInt(),
];

module.exports = {
  searchValidator,
  idParamValidator,
  productoValidator,
  asignaCategoriaValidator,
  eliminaCategoriaValidator,
};
