const bcrypt = require("bcrypt");
const { usuario, rol, Sequelize } = require("../models");
const {
  GeneraToken,
  TiempoRestanteToken,
} = require("../services/jwttoken.service");
const self = {};

self.login = async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await usuario.findOne({
      where: { email },
      raw: true,
      attributes: [
        "id",
        "email",
        "nombre",
        "passwordhash",
        [Sequelize.col("rol.nombre"), "rol"],
      ],
      include: { model: rol, attributes: [] },
    });
    if (data === null)
      return res
        .status(401)
        .json({ mensaje: "Usuario o contraseña incorrectos." });
    const passwordMatch = await bcrypt.compare(password, data.passwordhash);
    if (!passwordMatch)
      return res
        .status(401)
        .json({ mensaje: "Usuario o contraseña incorrectos." });
    const token = GeneraToken(data.email, data.nombre, data.rol);
    await req.bitacora("usuario.login", data.email);
    res
      .status(200)
      .json({
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        jwt: token,
      });
  } catch (error) {
    next(error);
  }
};

self.tiempo = async function (req, res) {
  const tiempo = TiempoRestanteToken(req);
  if (tiempo === null) return res.status(404).send();
  res.status(200).send(tiempo);
};

module.exports = self;
