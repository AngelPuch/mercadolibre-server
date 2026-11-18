const router = require('express').Router();
const productos = require('../controllers/productos.controller');
const Authorize = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  searchValidator,
  idParamValidator,
  productoValidator,
  asignaCategoriaValidator,
  eliminaCategoriaValidator,
} = require('../validators/productos.validator');

router.get('/', Authorize('Usuario,Administrador'), searchValidator, validate, productos.getAll);
router.get('/:id', Authorize('Usuario,Administrador'), idParamValidator, validate, productos.get);
router.post('/', Authorize('Administrador'), productoValidator, validate, productos.create);
router.put('/:id', Authorize('Administrador'), idParamValidator, productoValidator, validate, productos.update);
router.delete('/:id', Authorize('Administrador'), idParamValidator, validate, productos.delete);
router.post('/:id/categoria', Authorize('Administrador'), asignaCategoriaValidator, validate, productos.asignaCategoria);
router.delete('/:id/categoria/:categoriaid', Authorize('Administrador'), eliminaCategoriaValidator, validate, productos.eliminaCategoria);

module.exports = router;
