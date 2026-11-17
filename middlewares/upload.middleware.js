const multer = require("multer");

// Filtro para recibir únicamente imágenes JPG.
const imageFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/jpeg") &&
    file.originalname.endsWith(".jpg")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes con extensión JPG."), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

module.exports = multer({ storage, fileFilter: imageFilter });
