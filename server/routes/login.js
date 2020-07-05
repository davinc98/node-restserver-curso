const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();

//========================

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.json({
                ok: false,
                err: err
            });
        } else {
            if (!usuarioDB) {
                return res.json({
                    ok: false,
                    err: { message: '(Usuario) o contrasena incorrectos!' }
                });
            } else {
                if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                    return res.json({
                        ok: false,
                        err: { message: 'Usuario o (contrasena) incorrectos!' }
                    });
                } else {

                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });
                }
            }
        }
    })
});

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });

    const payload = ticket.getPayload();

    //console.log(payload);

    return {
        name: payload.name,
        email: payload.email,
        img: payload.img,
        google: true
    }
}
//verify().catch(console.error);


app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            console.log('ERROR 11');
            return res.json({
                ok: false,
                err
            });
        } else {
            console.log('OKAY 12');
            if (usuarioDB) {
                //console.log('El usuario existe!');
                if (usuarioDB.google === false) {

                    return res.json({
                        ok: false,
                        err: {
                            message: 'Debes usar autenticacion normal'
                        }
                    });

                } else {
                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    });
                }


            } else {

                //Si el usuario no existe en la BD
                let usuario = new Usuario();

                usuario.nombre = googleUser.name;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)';

                //console.log(usuario);

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        console.log('ERROR 123');
                        return res.json({
                            ok: false,
                            err
                        });
                    } else {

                        let token = jwt.sign({
                            usuario: usuarioDB
                        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                        return res.json({
                            ok: true,
                            usuario: usuarioDB,
                            token
                        });
                    }
                });
            }
        }
    });
});

//========================

module.exports = app;