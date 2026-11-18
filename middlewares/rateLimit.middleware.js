const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 30,
  maxEntries = 10000,
} = {}) => {
  for (const [nombre, valor] of Object.entries({
    windowMs,
    maxRequests,
    maxEntries,
  })) {
    if (!Number.isSafeInteger(valor) || valor <= 0) {
      throw new Error(
        `Rate limit: ${nombre} debe ser un entero positivo seguro.`,
      );
    }
  }

  const solicitudesPorIp = new Map();
  let siguienteLimpieza = 0;

  const limpiarExpirados = (ahora) => {
    let primeraExpiracion = Infinity;
    for (const [ip, registro] of solicitudesPorIp) {
      if (registro.hasta <= ahora) solicitudesPorIp.delete(ip);
      else primeraExpiracion = Math.min(primeraExpiracion, registro.hasta);
    }
    siguienteLimpieza = ahora + Math.min(windowMs, 60000);
    return primeraExpiracion;
  };

  const rechazar = (res, next, ahora, hasta) => {
    res.set(
      "Retry-After",
      String(Math.max(1, Math.ceil((hasta - ahora) / 1000))),
    );
    const error = new Error("Límite de solicitudes alcanzado.");
    error.statusCode = 429;
    return next(error);
  };

  return (req, res, next) => {
    const ahora = Date.now();
    if (ahora >= siguienteLimpieza) limpiarExpirados(ahora);

    const ip = req.ip;
    let registro = solicitudesPorIp.get(ip);
    if (registro && registro.hasta <= ahora) {
      solicitudesPorIp.delete(ip);
      registro = undefined;
    }

    if (!registro && solicitudesPorIp.size >= maxEntries) {
      const primeraExpiracion = limpiarExpirados(ahora);

      if (solicitudesPorIp.size >= maxEntries) {
        return rechazar(res, next, ahora, primeraExpiracion);
      }
    }
    if (registro && registro.cantidad >= maxRequests) {
      return rechazar(res, next, ahora, registro.hasta);
    }

    if (!registro) {
      registro = { cantidad: 0, hasta: ahora + windowMs };
      solicitudesPorIp.set(ip, registro);
    }
    registro.cantidad += 1;
    next();
  };
};

const loginRateLimit = createRateLimiter({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  maxRequests: Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 30),
});

const registroRateLimit = createRateLimiter({
  windowMs: Number(process.env.REGISTRO_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  maxRequests: Number(process.env.REGISTRO_RATE_LIMIT_MAX ?? 20),
});

module.exports = { createRateLimiter, loginRateLimit, registroRateLimit };
