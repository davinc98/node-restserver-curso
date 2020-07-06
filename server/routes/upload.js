const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//Default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    } else {
        //Validar TIPO
        let tiposValidos = ['productos', 'usuarios'];

        if (tiposValidos.indexOf(tipo) < 0) {
            return res.json({
                ok: false,
                err: {
                    message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
                    t: tipo
                }
            });
        }


        let archivo = req.files.archivo;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        console.log(nombreCortado);

        //Restringir extenciones:
        let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

        if (extensionesValidas.indexOf(extension) < 0) {
            return res.json({
                ok: false,
                err: {
                    message: 'Las extenciones validas son: ' + extensionesValidas.join(', '),
                    ext: extension
                }
            });
        }

        //Cambiar nombre al archivo
        // dsuu2u24n5in3-124.jpg
        let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

        archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
            if (err) {
                res.json({
                    ok: false,
                    err
                });
            } else {
                //La imagen ya se ha cargado

                if (tipo === 'usuarios') {
                    imagenUsuario(id, res, nombreArchivo);
                } else {
                    imagenProducto(id, res, nombreArchivo);
                }



            }
        });
    }
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios'); //El archivo se ha subido pero no se guardo correctamente
            return res.json({
                ok: false,
                err
            });
        } else {
            if (!usuarioDB) {
                borraArchivo(nombreArchivo, 'usuarios');
                return res.json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });
            } else {
                //let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
                //if (fs.existsSync(pathImagen)) { //Verofica si ya se ha subido una imagen
                //    fs.unlinkSync(pathImagen);
                //}
                borraArchivo(usuarioDB.img, 'usuarios');

                usuarioDB.img = nombreArchivo;
                usuarioDB.save((err, usuarioGuardado) => {
                    res.json({
                        ok: true,
                        usuario: usuarioGuardado,
                        img: nombreArchivo
                    });
                });
            }
        }
    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos'); //El archivo se ha subido pero no se guardo correctamente
            return res.json({
                ok: false,
                err
            });
        } else {
            if (!productoDB) {
                borraArchivo(nombreArchivo, 'productos');
                return res.json({
                    ok: false,
                    err: {
                        message: 'Producto no existe'
                    }
                });
            } else {

                borraArchivo(productoDB.img, 'productos');

                productoDB.img = nombreArchivo;
                productoDB.save((err, productoGuardado) => {
                    res.json({
                        ok: true,
                        producto: productoGuardado,
                        img: nombreArchivo
                    });
                });
            }
        }
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) { //Verifica si ya se ha subido una imagen
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;