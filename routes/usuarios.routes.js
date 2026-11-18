const router = require('express').Router();
const usuarios = require('../controllers/usuarios.controller');
const Authorize = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  emailParamValidator,
  usuarioCreateValidator,
  usuarioUpdateValidator,
} = require('../validators/usuarios.validator');

router.get('/', Authorize('Administrador'), usuarios.getAll);
router.get('/:email', Authorize('Administrador'), emailParamValidator, validate, usuarios.get);
router.post('/', Authorize('Administrador'), usuarioCreateValidator, validate, usuarios.create);
router.put('/:email', Authorize('Administrador'), usuarioUpdateValidator, validate, usuarios.update);
router.delete('/:email', Authorize('Administrador'), emailParamValidator, validate, usuarios.delete);

module.exports = router;
