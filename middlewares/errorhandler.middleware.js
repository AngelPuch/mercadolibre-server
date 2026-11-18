const fs = require('fs');
const requestIp = require('request-ip');
const ClaimTypes = require('../config/claimtypes');

const errorHandler = (err, req, res, next) => {
  const isJsonSyntaxError =
    err instanceof SyntaxError && err.status === 400 && 'body' in err;
  const statusCode = isJsonSyntaxError ? 400 : err.statusCode || 500;
  let mensaje = isJsonSyntaxError
    ? 'El cuerpo de la solicitud no contiene un JSON válido.'
    : 'No se ha podido procesar la petición. Inténtelo nuevamente más tarde.';
  const ip = requestIp.getClientIp(req);
  let email = 'Anónimo';
  if (req.decodedToken) email = req.decodedToken[ClaimTypes.Name];

  fs.appendFile('log/log.txt', new Date() + ` - ${statusCode} - ${ip} - ${email} - ${err.message || mensaje}\n`, error => {
    if (error) console.error(error);
  });

  if (statusCode >= 400 && statusCode < 500) {
    mensaje = isJsonSyntaxError ? mensaje : err.message || mensaje;
    return res.status(statusCode).json({ status: statusCode, mensaje });
  }

  if (process.env.NODE_ENV === 'development') {
    mensaje = err.message || mensaje;
    res.status(statusCode).json({ status: statusCode, mensaje, stack: err.stack });
  } else {
    res.status(statusCode).send({ mensaje });
  }
};

module.exports = errorHandler;
