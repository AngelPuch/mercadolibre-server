const express = require("express");
const router = express.Router();
const registro = require("../controllers/registro.controller");
const validate = require("../middlewares/validation.middleware");
const bitacora = require("../middlewares/bitacora.middleware");
const { registroRateLimit } = require("../middlewares/rateLimit.middleware");
const { registroValidator } = require("../validators/registro.validator");

router.post(
  "/",
  (req, res, next) => {
    req.registroPublico = true;
    next();
  },
  registroRateLimit,
  express.json({ limit: "8kb" }),
  express.urlencoded({ extended: false, limit: "8kb", parameterLimit: 20 }),
  registroValidator,
  validate,
  bitacora,
  registro.create,
);

module.exports = router;
