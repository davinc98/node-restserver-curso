const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//MOSTRAR CATEGORIAS
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    categorias
                });
            }
        });
});

//MOSTRAR CATEGORIA POR ID
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            res.json({
                ok: false,
                err
            });
        } else {
            if (!categoriaDB) {
                res.json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            } else {
                res.json({
                    ok: true,
                    categoria: categoriaDB
                });
            }

        }
    });
});

//CREAR CATEGORIA
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            res.json({
                ok: false,
                err
            });
        } else {
            if (!categoriaDB) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    categoria: categoriaDB
                });
            }
        }
    });

});

//ACTUALIZAR UNA CATEGORIA
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            res.json({
                ok: false,
                err
            });
        } else {
            if (!categoriaDB) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    categoria: categoriaDB
                });
                console.log('Objeto Actualizado!');
            }
        }
    });
});

//BORRAR CATEGORIA
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //Solo el administrador puede borrar 
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            res.json({
                ok: false,
                err
            });
        } else {
            if (!categoriaDB) {
                res.json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            } else {
                res.json({
                    ok: true,
                    message: 'Categoria borrada'
                });
            }
        }
    });
});

module.exports = app;