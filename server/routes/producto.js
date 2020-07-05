const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//Obtener Productos
app.get('/productos', verificaToken, (req, res) => {
    //Muestra todos productos
    //Populate: usuario categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    productos
                });
            }
        })
});

//Obtener un producto por id
app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario categoria
    //paginado
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                if (!productoDB) {
                    res.json({
                        ok: false,
                        err: {
                            message: 'No existe ID'
                        }
                    });
                } else {
                    res.json({
                        ok: true,
                        producto: productoDB
                    });
                }
            }
        });
});


//Buscar Productos por un termino
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    //Expresion regular
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                res.json({
                    ok: true,
                    productos
                });
            }
        })
});


//Crear nuevo producto 
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            res.json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                producto: productoDB
            });
        }
    });

});

//Actualizar un producto por id
app.put('/productos/:id', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            res.json({
                ok: false,
                err
            });
        } else {
            if (!productoDB) {
                res.json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            } else {
                productoDB.nombre = body.nombre;
                productoDB.precioUni = body.precioUni;
                productoDB.categoria = body.categoria;
                productoDB.disponible = body.disponible;
                productoDB.descripcion = body.descripcion;

                productoDB.save((err, productoGuardado) => {
                    if (err) {
                        res.json({
                            ok: false,
                            err
                        });
                    } else {
                        res.json({
                            ok: true,
                            producto: productoGuardado
                        });
                    }
                });

            }
        }
    });


});

//Borrar un producto por id
app.delete('/productos/:id', verificaToken, (req, res) => {
    //Disponible: false

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        } else {
            if (!productoDB) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            } else {
                productoDB.disponible = false;

                productoDB.save((err, productoBorrado) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            err
                        });
                    } else {
                        res.json({
                            ok: true,
                            producto: productoBorrado,
                            message: 'Producto Borrado'
                        });
                    }
                });
            }

        }
    });
});

module.exports = app;