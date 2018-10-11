let express  = require('express');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

let mdAutenticacion = require('../middlewares/autenticacion');

let app = express();

let Usuario = require('../models/usuario');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if ( err ) {
                return res.status(500).json({
                    ok     : false,
                    mensaje: 'Error al cargar usuario',
                    errors : err
                });
            }

            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok      : true,
                    usuarios: usuarios,
                    total: conteo
                });
            })


        });
});

// Actualizar usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id   = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if ( err ) {
            return res.status(500).json({
                ok     : false,
                mensaje: 'Error al buscar usuario',
                errors : err
            });
        }

        if ( !usuario ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors : { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email  = body.email;
        usuario.role   = body.role;

        usuario.save((err, usuarioGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok     : false,
                    mensaje: 'Error al actualizar usuario',
                    errors : err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok     : true,
                usuario: usuarioGuardado
            })
        })
    });
});

// Crear usuario
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre  : body.nombre,
        email   : body.email,
        password: bcrypt.hashSync(body.password, 10),
        img     : body.img,
        role    : body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if ( err ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'Error al crear usuario',
                errors : err
            });
        }

        res.status(201).json({
            ok          : true,
            usuario     : usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// Eliminar usuario
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if ( !usuarioBorrado ) {
            return res.status(404).json({
                ok     : false,
                mensaje: 'No existe un usuario con ese id',
                errors : { message: 'No existe un usuario con ese id' }
            });
        }

        if ( err ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'Error al borrar usuario',
                errors : err
            });
        }

        res.status(200).json({
            ok     : true,
            usuario: usuarioBorrado
        })
    })
});

module.exports = app;
