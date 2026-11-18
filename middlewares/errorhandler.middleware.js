const fs = require("fs");
const requestIp = require("request-ip");
const ClaimTypes = require("../config/claimtypes");

const errorHandler = (err, req, res, next) => {
  const isJsonSyntaxError =
    err instanceof SyntaxError && err.status === 400 && "body" in err;
  const esRegistroPublico = req.registroPublico === true;
  const errorEntradaRegistro =
    esRegistroPublico && err.status >= 400 && err.status < 500;
  const statusCode =
    isJsonSyntaxError || errorEntradaRegistro ? 400 : err.statusCode || 500;
  let mensaje = isJsonSyntaxError
    ? "El cuerpo de la solicitud no contiene un JSON válido."
    : "No se ha podido procesar la petición. Inténtelo nuevamente más tarde.";
  const ip = esRegistroPublico ? req.ip : requestIp.getClientIp(req);
  let email = "Anónimo";
  if (req.decodedToken) email = req.decodedToken[ClaimTypes.Name];

  const detalleLog = esRegistroPublico
    ? "Error en registro público."
    : err.message || mensaje;
  fs.appendFile(
    "log/log.txt",
    new Date() + ` - ${statusCode} - ${ip} - ${email} - ${detalleLog}\n`,
    (error) => {
      if (error) console.error(error);
    },
  );

  if (esRegistroPublico) {
    const mensajes = {
      400: "La solicitud de registro no es válida.",
      409: "El correo electrónico ya está registrado.",
      429: "Demasiados intentos de registro. Inténtelo más tarde.",
      503: "El registro no está disponible. Inténtelo más tarde.",
    };
    return res.status(statusCode).json({
      mensaje:
        mensajes[statusCode] ||
        "No se ha podido completar el registro. Inténtelo más tarde.",
    });
  }

  if (statusCode >= 400 && statusCode < 500) {
    mensaje = isJsonSyntaxError ? mensaje : err.message || mensaje;
    return res.status(statusCode).json({ status: statusCode, mensaje });
  }

  if (process.env.NODE_ENV === "development") {
    mensaje = err.message || mensaje;
    res
      .status(statusCode)
      .json({ status: statusCode, mensaje, stack: err.stack });
  } else {
    res.status(statusCode).send({ mensaje });
  }
};

module.exports = errorHandler;
