let express         = require('express');
let mdAutenticacion = require('../middlewares/autenticacion');

let app      = express();
let Hospital = require('../models/hospital');

// Obtener todos los hospitales
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde     = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if ( err ) {
                return res.status(500).json({
                    ok     : false,
                    mensaje: 'Error al cargar los hospitales',
                    errors : err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok        : true,
                    hospitales: hospitales,
                    total     : conteo
                });
            })

        });
});

// Crear hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;

    let hospital = new Hospital({
        nombre : body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if ( err ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'Error al crear el hospital',
                errors : err
            });
        }

        res.status(201).json({
            ok      : true,
            hospital: hospitalGuardado
        });
    });
});

// Actualizar hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id   = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if ( err ) {
            return res.status(500).json({
                ok     : false,
                mensaje: 'Error al buscar el hospital',
                errors : err
            });
        }

        if ( !hospital ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors : { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre  = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok     : false,
                    mensaje: 'Error al actualizar el hospital',
                    errors : err
                });
            }

            res.status(200).json({
                ok      : true,
                hospital: hospitalGuardado
            })
        })
    });
});

// Eliminar hospital
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if ( !hospitalBorrado ) {
            return res.status(404).json({
                ok     : false,
                mensaje: 'No existe un hospital con ese id',
                errors : { message: 'No existe un hospital con ese id' }
            });
        }

        if ( err ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'Error al borrar hospital',
                errors : err
            });
        }

        res.status(200).json({
            ok      : true,
            hospital: hospitalBorrado
        })
    })
});

module.exports = app;