//Puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Vencimiento de token
process.env.CADUCIDAD_TOKEN = '48h';

//SEED de autenticacion
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//BASE DE DATOS
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.urlDB = urlDB;

//Google CLIENT ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '423082578871-kivvhiklvnk7rn9ko9egeagmj82ui7va.apps.googleusercontent.com';