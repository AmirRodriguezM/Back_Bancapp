// index.js
const dotenv = require('dotenv');
dotenv.config();

const Server = require('./src/models/server_models'); // Importa la clase del servidor

// Crear una nueva instancia del servidor
new Server();