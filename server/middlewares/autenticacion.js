const jwt = require('jsonwebtoken');

//VERIFICACION DEL TOKEN
let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            res.json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        } else {
            req.usuario = decoded.usuario;
            next();
        }
    });
};

//VERIFICA ADMIN ROLE
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador!'
            }
        });
    }

}

//Verifica token por url
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            res.json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        } else {
            req.usuario = decoded.usuario;
            next();
        }
    });
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}