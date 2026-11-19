const fs = require("fs");
const requestIp = require("request-ip");
const ClaimTypes = require("../config/claimtypes");

const errorHandler = (err, req, res, next) => {
  const isJsonSyntaxError =
    err instanceof SyntaxError && err.status === 400 && "body" in err;
  const esRegistroPublico = req.registroPublico === true;
  const esCarrito = req.carritoPrivado === true;
  const esRateLimit = err.statusCode === 429 || err.status === 429;
  const errorEntradaRegistro =
    esRegistroPublico && err.status >= 400 && err.status < 500;
  let statusCode = err.statusCode || 500;
  if (isJsonSyntaxError || errorEntradaRegistro) statusCode = 400;
  if (esRateLimit) statusCode = 429;
  let mensaje = isJsonSyntaxError
    ? "El cuerpo de la solicitud no contiene un JSON válido."
    : "No se ha podido procesar la petición. Inténtelo nuevamente más tarde.";
  const ip =
    esRegistroPublico || esRateLimit ? req.ip : requestIp.getClientIp(req);
  let email = "Anónimo";
  if (req.decodedToken) email = req.decodedToken[ClaimTypes.Name];

  let detalleLog = err.message || mensaje;
  if (esRegistroPublico) detalleLog = "Error en registro público.";
  if (esCarrito && statusCode >= 500)
    detalleLog = "Error al procesar el carrito.";
  if (esRateLimit) detalleLog = "Límite de solicitudes alcanzado.";
  fs.appendFile(
    "log/log.txt",
    new Date() + ` - ${statusCode} - ${ip} - ${email} - ${detalleLog}\n`,
    (error) => {
      if (error) console.error(error);
    },
  );

  if (esRateLimit) {
    return res.status(429).json({
      mensaje: "Demasiadas solicitudes. Inténtelo más tarde.",
    });
  }

  if (esCarrito && statusCode >= 500) {
    return res.status(statusCode).json({
      mensaje: "No se ha podido procesar el carrito. Inténtelo más tarde.",
    });
  }

  if (esRegistroPublico) {
    const mensajes = {
      400: "La solicitud de registro no es válida.",
      409: "El correo electrónico ya está registrado.",
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
