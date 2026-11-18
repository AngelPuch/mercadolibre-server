const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const ClaimTypes = require("../config/claimtypes");
const { GeneraToken } = require("../services/jwttoken.service");

const Authorize = (rol) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      const error = new Error("Acceso denegado");
      error.statusCode = 401;
      if (!authHeader || !authHeader.startsWith("Bearer ")) return next(error);

      const token = authHeader.split(" ")[1];
      if (!token) return next(error);

      const decodedToken = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
        issuer: "ServidorFeiJWT",
        audience: "ClientesFeiJWT",
      });

      if (
        !decodedToken ||
        typeof decodedToken !== "object" ||
        !decodedToken.exp ||
        !decodedToken.sub ||
        !decodedToken[ClaimTypes.Name] ||
        !decodedToken[ClaimTypes.Role]
      ) {
        return next(error);
      }

      req.decodedToken = decodedToken;

      const rolesPermitidos = rol.split(",").map((r) => r.trim());
      if (!rolesPermitidos.includes(decodedToken[ClaimTypes.Role])) {
        error.statusCode = 403;
        return next(error);
      }

      const minutosRestantes =
        (decodedToken.exp - new Date().getTime() / 1000) / 60;
      if (minutosRestantes < 5) {
        const nuevoToken = GeneraToken(
          decodedToken[ClaimTypes.Name],
          decodedToken[ClaimTypes.GivenName],
          decodedToken[ClaimTypes.Role],
          decodedToken.sub,
        );
        res.header("Set-Authorization", nuevoToken);
      }
      next();
    } catch (error) {
      error.statusCode = 401;
      next(error);
    }
  };
};

module.exports = Authorize;
