const router = require("express").Router();
const registro = require("../controllers/registro.controller");
const validate = require("../middlewares/validation.middleware");
const { registroValidator } = require("../validators/registro.validator");

router.post("/", registroValidator, validate, registro.create);

module.exports = router;
