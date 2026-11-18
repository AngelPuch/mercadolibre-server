const requestIp = require("request-ip");
const ClaimTypes = require("../config/claimtypes");
const { bitacora } = require("../models");

const bitacoralogger = (req, res, next) => {
  const ip = requestIp.getClientIp(req);
  let email = "invitado";
  req.bitacora = async (accion, id, { transaction } = {}) => {
    if (req.decodedToken) email = req.decodedToken[ClaimTypes.Name];
    await bitacora.create(
      { accion, elementoid: id, ip, usuario: email, fecha: new Date() },
      { transaction },
    );
  };
  next();
};

module.exports = bitacoralogger;
