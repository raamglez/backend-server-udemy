let express    = require('express');
let fileUpload = require('express-fileupload');
let fs         = require('fs');

let app = express();

let Usuario  = require('../models/usuario');
let Medico   = require('../models/medico');
let Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    let tipo = req.params.tipo;
    let id   = req.params.id;

    // Tipos de coleccion
    let tiposValidos = [ 'hospitales', 'medicos', 'usuarios' ];
    if ( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok     : true,
            mensaje: 'Tipo de colección no es válida',
            error  : { message: 'Tipo de colección no es válida' }
        });
    }

    if ( !req.files ) {
        return res.status(400).json({
            ok     : true,
            mensaje: 'No seleccionó nada',
            error  : { message: 'Debe de sleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    let archivo          = req.files.img;
    let nombreCortado    = archivo.name.split('.');
    let extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    // Solo estas extensiones aceptamos
    let extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

    if ( extensionesValidas.indexOf(extensionArchivo) < 0 ) {
        return res.status(400).json({
            ok     : true,
            mensaje: 'Extension no válida',
            error  : { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    //Mover el archivo del temporal a un path
    let path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if ( err ) {
            return res.status(400).json({
                ok     : true,
                mensaje: 'Error al mover archivo',
                error  : err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if ( tipo === 'usuarios' ) {
        
        Usuario.findById(id, (err, usuario) => {
            if ( !usuario ) {
                return res.status(400).json({
                    ok     : false,
                    mensaje: 'No existe el usuario',
                    errors : { message: 'Usuario no existe' }
                });
            }

            let pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = '>:v';
                return res.status(200).json({
                    ok     : true,
                    mensaje: 'Imagen de usuario actualziada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if ( tipo === 'medicos' ) {
        Medico.findById(id, (err, medico) => {

            if ( !medico ) {
                return res.status(400).json({
                    ok     : false,
                    mensaje: 'No existe el medico',
                    errors : { message: 'Medico no existe' }
                });
            }

            let pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok       : true,
                    mensaje  : 'Imagen de medico actualziada',
                    pathViejo: pathViejo,
                    medico   : medicoActualizado
                });
            });
        });
    }

    if ( tipo === 'hospitales' ) {
        Hospital.findById(id, (err, hospital) => {

            if ( !hospital ) {
                return res.status(400).json({
                    ok     : false,
                    mensaje: 'No existe el hospital',
                    errors : { message: 'Hospital no existe' }
                });
            }

            let pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok       : true,
                    mensaje  : 'Imagen de hospital actualziada',
                    pathViejo: pathViejo,
                    hospital : hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;