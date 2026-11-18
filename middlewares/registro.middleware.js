const express = require("express");

const ventanaMs = 15 * 60 * 1000;
const maxIntentos = 5;
const maxDirecciones = 10000;
const intentosPorIp = new Map();

const protegerRegistro = (req, res, next) => {
  req.registroPublico = true;
  if (req.method !== "POST") return next();

  const ahora = Date.now();
  const ip = req.ip;
  let intentos = intentosPorIp.get(ip);
  if (intentos && intentos.hasta <= ahora) {
    intentosPorIp.delete(ip);
    intentos = undefined;
  }
  if (!intentos && intentosPorIp.size >= maxDirecciones) {
    for (const [direccion, registro] of intentosPorIp) {
      if (registro.hasta <= ahora) intentosPorIp.delete(direccion);
    }
  }
  if (
    (intentos && intentos.cantidad >= maxIntentos) ||
    (!intentos && intentosPorIp.size >= maxDirecciones)
  ) {
    const hasta = intentos?.hasta || ahora + ventanaMs;
    res.set("Retry-After", String(Math.ceil((hasta - ahora) / 1000)));
    const error = new Error("Límite de registro público alcanzado.");
    error.statusCode = 429;
    return next(error);
  }

  if (!intentos) {
    intentos = { cantidad: 0, hasta: ahora + ventanaMs };
    intentosPorIp.set(ip, intentos);
  }
  intentos.cantidad += 1;
  next();
};

module.exports = [
  protegerRegistro,
  express.json({ limit: "8kb" }),
  express.urlencoded({ extended: false, limit: "8kb", parameterLimit: 20 }),
];
