// Requires
let express    = require('express');
let mongoose   = require('mongoose');
let bodyParser = require('body-parser');

// Inicializar variables
let app = express();

// Body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Importar rutas
let appRoutes      = require('./routes/app');
let usuarioRoutes  = require('./routes/usuario');
let loginRoutes    = require('./routes/login');
let hospitalRoutes = require('./routes/hospital');
let medicoRoutes   = require('./routes/medico');
let busquedaRoutes = require('./routes/busqueda');
let uploadRoutes = require('./routes/upload');
let imagenesRoutes = require('./routes/imagenes');

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if ( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online')
});

// Rutas
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online')
});