require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

const bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


//===================================================
//ESTO DEBERIA ESTAR EN usuario.js

const Usuario = require('./models/usuario');
const { response } = require('express');
const usuario = require('./models/usuario');

const { verificaToken, verificaAdmin_Role } = require('./middlewares/autenticacion');

app.get('/usuario', verificaToken, (req, res) => {

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.limite || 5;
    limite = Number(limite);

    let condiciones = {
        estado: true
    }

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                //return response.status(400).json({
                res.json({
                    ok: false,
                    err: err
                });
            } else {
                Usuario.countDocuments({ estado: true }, (err, conteo) => {
                    res.json({
                        ok: true,
                        usuarios: usuarios,
                        cuantos: conteo
                    });
                })

            }
        })


});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;
    console.log(body); //hshshdshihgoirghorjo

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            //return response.status(400).json({
            res.json({
                ok: false,
                err: err
            });
        } else {
            //usuarioDB.password = null;
            res.json({
                ok: true,
                usuario: usuarioDB
            });
        }

        console.log("Hola Error!");


    });

});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) { //ACTUALIZAR USUARIO

    let id = req.params.id;
    //Seleccion a los campos permitidos para actualizar por este metodo
    let body = _.pick(req.body, ['nombre', 'email', 'role', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        //console.log('OKAY :V');
        if (err) {
            res.json({
                ok: false,
                err: err
            });
        } else {
            res.json({
                ok: true,
                usuario: usuarioDB
            });
        }
    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            res.json({
                ok: false,
                err: err
            });
        } else {

            if (!usuarioBorrado) {
                res.json({
                    ok: false,
                    error: { message: 'Usuario no encontrado' }
                });
            } else {
                res.json({
                    ok: true,
                    usuario: usuarioBorrado
                });
            }
        }
    });


});
//========================================================
//ESTO DEBERIA ESTAR EN LOGIN.JS
const jwt = require('jsonwebtoken');


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            res.json({
                ok: false,
                err: err
            });
        } else {
            if (!usuarioDB) {
                res.json({
                    ok: false,
                    err: { message: '(Usuario) o contrasena incorrectos!' }
                });
            } else {
                if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                    res.json({
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

//============================================



mongoose.connect(process.env.urlDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err, resp) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});