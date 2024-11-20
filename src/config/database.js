const { Sequelize } = require('sequelize');

// Datos de conexión
const dbName = '';
const dbUser = '';
const dbPassword = '';
const dbHost = '';
const dbPort = '';

// Crear una nueva instancia de Sequelize para conectarse a la base de datos
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mssql',
    port: dbPort,
    dialectOptions: {
        encrypt: true,
        trustServerCertificate: false,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: false,
    timezone: 'UTC', // Cambia a UTC para guardar fechas de forma consistente
});

module.exports = sequelize;
