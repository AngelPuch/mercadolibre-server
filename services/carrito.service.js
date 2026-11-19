const { usuario } = require("../models");

const bloquearPropietario = async (usuarioid, transaction) => {
  const propietario = await usuario.findByPk(usuarioid, {
    attributes: ["id"],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!propietario) {
    const error = new Error("Acceso denegado.");
    error.statusCode = 401;
    throw error;
  }
  return propietario;
};

module.exports = { bloquearPropietario };
