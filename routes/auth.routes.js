const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const Authorize = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { loginValidator } = require('../validators/auth.validator');
const { loginRateLimit } = require('../middlewares/rateLimit.middleware');

router.post('/', loginRateLimit, loginValidator, validate, auth.login);
router.get('/tiempo', Authorize('Usuario,Administrador'), auth.tiempo);

module.exports = router;
