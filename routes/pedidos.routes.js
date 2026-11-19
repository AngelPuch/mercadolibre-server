const router = require("express").Router();
const pedidos = require("../controllers/pedidos.controller");
const Authorize = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { confirmarPedidoValidator } = require("../validators/pedidos.validator");

router.post(
  "/",
  (req, res, next) => {
    req.pedidoPrivado = true;
    next();
  },
  Authorize("Usuario,Administrador"),
  confirmarPedidoValidator,
  validate,
  pedidos.create,
);

module.exports = router;
