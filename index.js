const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Primero carga la configuración para que esté disponible en las demás llamadas.
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  methods: 'GET,PUT,POST,DELETE',
  exposedHeaders: ['Set-Authorization']
};
app.use(cors(corsOptions));

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Bitácora
app.use(require('./middlewares/bitacora.middleware'));

// Rutas
app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/archivos', require('./routes/archivos.routes'));
app.use('/api/bitacora', require('./routes/bitacora.routes'));
app.get('/*splat', (req, res) => res.status(404).send('Recurso no encontrado'));

// Debe ser el último middleware.
const errorhandler = require('./middlewares/errorhandler.middleware');
app.use(errorhandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Aplicación de ejemplo escuchando en el puerto ${process.env.SERVER_PORT}`);
});
