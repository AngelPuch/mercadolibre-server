const router = require("express").Router();
const carrito = require("../controllers/carrito.controller");
const Authorize = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  consultarValidator,
  agregarValidator,
  actualizarValidator,
  eliminarValidator,
} = require("../validators/carrito.validator");

router.use((req, res, next) => {
  req.carritoPrivado = true;
  next();
}, Authorize("Usuario,Administrador"));

router.get("/", consultarValidator, validate, carrito.get);
router.post("/items", agregarValidator, validate, carrito.add);
router.put("/items/:productoId", actualizarValidator, validate, carrito.update);
router.delete(
  "/items/:productoId",
  eliminarValidator,
  validate,
  carrito.delete,
);

module.exports = router;
