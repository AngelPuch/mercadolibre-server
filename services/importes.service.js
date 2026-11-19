const precioEnCentavos = (precio) => {
  const valor = String(precio);
  const [entero, fraccion = ""] = valor.replace(/^-/, "").split(".");
  const centavos = BigInt(entero) * 100n + BigInt(fraccion.padEnd(2, "0"));
  return valor.startsWith("-") ? -centavos : centavos;
};

const formatearImporte = (centavos) => {
  const absoluto = centavos < 0n ? -centavos : centavos;
  return `${centavos < 0n ? "-" : ""}${absoluto / 100n}.${String(absoluto % 100n).padStart(2, "0")}`;
};

module.exports = { precioEnCentavos, formatearImporte };
