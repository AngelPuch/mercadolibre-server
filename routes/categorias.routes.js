const router = require('express').Router();
const categorias = require('../controllers/categorias.controller');
const Authorize = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  idParamValidator,
  categoriaValidator,
} = require('../validators/categorias.validator');

router.get('/', Authorize('Usuario,Administrador'), categorias.getAll);
router.get('/:id', Authorize('Usuario,Administrador'), idParamValidator, validate, categorias.get);
router.post('/', Authorize('Administrador'), categoriaValidator, validate, categorias.create);
router.put('/:id', Authorize('Administrador'), idParamValidator, categoriaValidator, validate, categorias.update);
router.delete('/:id', Authorize('Administrador'), idParamValidator, validate, categorias.delete);

module.exports = router;
