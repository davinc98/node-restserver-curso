const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();


app.get('/usuario', (req, res) => {

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
//==============================

module.exports = app;