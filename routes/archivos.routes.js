const router = require('express').Router();
const archivos = require('../controllers/archivos.controller');
const Authorize = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');
const { idParamValidator } = require('../validators/archivos.validator');

router.get('/', Authorize('Administrador'), archivos.getAll);
router.get('/:id', idParamValidator, validate, archivos.get);
router.get('/:id/detalle', Authorize('Administrador'), idParamValidator, validate, archivos.getDetalle);
router.post('/', Authorize('Administrador'), upload.single('file'), archivos.create);
router.put('/:id', Authorize('Administrador'), idParamValidator, validate, upload.single('file'), archivos.update);
router.delete('/:id', Authorize('Administrador'), idParamValidator, validate, archivos.delete);

module.exports = router;
