const { bitacora } = require('../models');
const self = {};

self.getAll = async function (req, res, next) {
  const data = await bitacora.findAll({
    attributes: [['id', 'bitacoraId'], 'accion', 'elementoid', 'ip', 'usuario', 'fecha'],
    order: [['id', 'DESC']]
  });
  res.status(200).json(data);
};

module.exports = self;
