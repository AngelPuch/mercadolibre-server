const { rol } = require('../models');
const self = {};

self.getAll = async function (req, res) {
  const data = await rol.findAll({ attributes: ['id', 'nombre'] });
  res.status(200).json(data);
};

module.exports = self;
