let express  = require('express');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const SEED   = require('../config/config').SEED;

let Usuario = require('../models/usuario');
let app     = express();

//Google
const CLIENT_ID        = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client           = new OAuth2Client(CLIENT_ID);

// Autenticacion de Google
async function verify(token) {
    const ticket  = await client.verifyIdToken({
        idToken : token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email : payload.email,
        img   : payload.picture,
        google: payload.name,
    }
}

app.post('/google', async (req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token).catch(e => {
        res.status(403).json({
            ok     : false,
            mensaje: "Token no válido"
        })
    });

    res.status(200).json({
        ok     : true,
        mensaje: "OK",
        googleUser: googleUser
    })
});

// Autenticación normal
app.post('/', (req, res) => {

    const body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if ( err ) {
            return res.status(500).json({
                ok     : false,
                mensaje: 'Error al buscar usuario',
                errors : err
            });
        }

        if ( !usuarioDB ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'Credenciales incorrectas - email',
                errors : err
            });
        }

        if ( !bcrypt.compareSync(body.password, usuarioDB.password) ) {
            return res.status(400).json({
                ok     : false,
                mensaje: 'Credenciales incorrectas - password',
                errors : err
            });
        }

        // Crear un token!!
        usuarioDB.pass = '>:v';
        const token    = jwt.sign(
            { usuario: usuarioDB },
            SEED,
            { expiresIn: 14400 }
        );


        res.status(200).json({
            ok     : true,
            token  : token,
            usuario: usuarioDB,
            id     : usuarioDB._id
        });
    });
});

module.exports = app;