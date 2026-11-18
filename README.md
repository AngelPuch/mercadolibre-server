# Diferencias respecto al PDF

- **Dependencia omitida (págs. 15, 37 y 39):** agregué `express-validator` a `package.json` y `package-lock.json`. Los controladores del documento lo importan, pero no figura en sus instrucciones de instalación; sin él, el servidor no inicia.
- **Variable de almacenamiento (págs. 45 y 46):** corregí en el `.env` existente `FILE_IN_BD` a `FILES_IN_BD`, el nombre que consultan los controladores. Conservé su valor; con nombres distintos no se podía seleccionar correctamente el almacenamiento en MySQL.
- **Reversión del seeder de usuarios (pág. 33):** `down()` elimina primero los usuarios y después los roles. El orden del PDF viola la clave foránea `usuario.rolid`.
- **Bitácora (págs. 38–55):** esperé con `await` las llamadas a `req.bitacora(...)`. Así, sus errores llegan al manejador de errores y la respuesta de éxito se envía después de guardar la operación. En la actualización de archivos registré el ID solicitado, en lugar de `data.id`: `update()` devuelve un arreglo de cantidades afectadas, no una instancia con ID.
- **Filtro de archivos (pág. 36):** pasé un objeto `Error` al callback de Multer en lugar de una cadena, para que el manejador pueda obtener y registrar `err.message` al rechazar un archivo.
- **Autorización de cargas (pág. 59):** ejecuté `Authorize(...)` antes de `upload.single('file')` en POST y PUT. En el orden del PDF, una solicitud sin autorización podía escribir archivos en disco antes de ser rechazada.
- **Usuarios (págs. 49 y 50):** comprobé que el rol exista antes de usar su ID y respondí 400 cuando no existe. Comprobé que el usuario exista antes de consultar `protegido` y respondí 404 cuando no existe. Esto evita acceder a propiedades de `null`. Al actualizar una contraseña recibida como `password`, calculé su hash con bcrypt: el modelo almacena `passwordhash`, por lo que el `update(req.body)` del PDF ignoraba la contraseña enviada.
- **Autenticación (págs. 55 y 56):** declaré `token` con `const` para evitar una variable global compartida entre solicitudes; agregué `return` a la respuesta 404 de `tiempo()` para evitar enviar una segunda respuesta. Comprobé la existencia del encabezado Authorization antes de consultar `startsWith`, conservando la respuesta 401 prevista.
- **Renovación desde el navegador (págs. 56 y 61):** agregué `exposedHeaders: ['Set-Authorization']` a CORS. Sin ello, el cliente web no puede leer el encabezado que contiene el token renovado.
- **Inconsistencias de la tabla de API (pág. 2):** seguí el código detallado de controladores y rutas (págs. 48–59): inicio de sesión mediante `POST /api/auth`, tiempo restante en `GET /api/auth/tiempo`, usuarios identificados por email y descarga pública en `GET /api/archivos/:id`. No agregué rutas alternativas para los nombres o métodos contradictorios de la tabla.
- **Peticiones de ejemplo (págs. 64–69):** completé los encabezados Bearer omitidos en algunas solicitudes protegidas y utilicé IDs de ejemplo coherentes para crear, editar y eliminar el mismo registro. Incorporé las peticiones de productos, usuarios y bitácora solicitadas en las instrucciones, además de los ejemplos mostrados de autenticación, categorías y archivos; incluí los dos JPG locales referenciados por las cargas.

Las diferencias de formato del código (sangría, punto y coma, `const` y comentarios) no cambian su funcionamiento. Los modelos, las migraciones y la configuración de conexión ya existentes se conservaron sin modificaciones.

## Límites de login y registro

El middleware `middlewares/rateLimit.middleware.js` exporta `createRateLimiter` y dos instancias independientes. Solo se aplica a `POST /api/auth` y `POST /api/registro`; no existe un límite global para la API ni se limita `GET /api/auth/tiempo`.

Configura estas variables en `.env` antes de iniciar el servidor:

| Variable | Valor predeterminado | Significado |
| --- | --- | --- |
| `LOGIN_RATE_LIMIT_MAX` | `30` | Solicitudes de login por IP y ventana |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | `900000` | Duración de la ventana de login, en milisegundos |
| `REGISTRO_RATE_LIMIT_MAX` | `20` | Solicitudes de registro por IP y ventana |
| `REGISTRO_RATE_LIMIT_WINDOW_MS` | `900000` | Duración de la ventana de registro, en milisegundos |

Los valores deben ser enteros positivos seguros. Una configuración inválida impide iniciar el servidor. Cada ventana comienza con la primera solicitud de esa IP y cuenta todos los intentos que llegan al limitador, incluidos los rechazados por validación, credenciales o correo duplicado. En login, los parsers generales conservan su orden y configuración, por lo que sus errores ocurren antes del limitador.

Cada instancia conserva su propio `Map` en memoria, con capacidad predeterminada de 10 000 IP. Los registros expirados se limpian al recibir solicitudes, periódicamente, al consultar una IP expirada y antes de rechazar por capacidad. Cuando la memoria está llena de registros activos, se rechazan nuevas IP sin expulsar las existentes ni reiniciar sus contadores. `createRateLimiter({ windowMs, maxRequests, maxEntries })` permite reutilizar y configurar esta lógica.

Al exceder el límite se devuelve HTTP 429 con `{"mensaje":"Demasiadas solicitudes. Inténtelo más tarde."}` y `Retry-After` en segundos. CORS permite leer ese encabezado desde los orígenes ya autorizados. Se usa exclusivamente `req.ip`, sin leer directamente `X-Forwarded-For` ni activar `trust proxy`. Si se incorpora un proxy, su confianza deberá configurarse explícitamente con las direcciones confiables.

Los contadores se reinician al reiniciar el proceso y **no se comparten entre múltiples procesos o servidores**. Esta implementación no requiere dependencias ni almacenamiento externo.

## Registro atómico y tamaño del cuerpo

`POST /api/registro` conserva sus parsers JSON y URL-encoded de 8 KiB, separados del rate limiting y ejecutados antes de los parsers generales. Un cuerpo excesivo, JSON malformado o entrada inválida devuelve 400 sin incluir valores sensibles. El resto de endpoints conserva sus parsers generales.

La creación del usuario y el evento `usuario.registro` se guardan dentro de la misma transacción Sequelize. `req.bitacora(accion, id, { transaction })` permite compartirla; las llamadas existentes de dos argumentos mantienen su comportamiento. Si falla cualquiera de las escrituras, ambas se revierten. El correo duplicado sigue devolviendo 409, incluso si la restricción única de la base de datos detecta un registro concurrente. El rol `Usuario`, bcrypt y las validaciones de B3 se conservan.
