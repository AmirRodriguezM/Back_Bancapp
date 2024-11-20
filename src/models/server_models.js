const express = require('express');
const cors = require('cors');
const authenticateRoute = require('../routes/authentication_routes.js'); // Rutas para autenticación (login y creación de usuario)
const sequelize = require('../config/database');
const adminPermisoRoutes = require('../routes/obtenerPermisosUsuarios');
const adminCuentaRoutes = require ('../routes/obtainProducts.js');
const movementUserRoutes = require ('../routes/movementUser.js')
const movementhistoryUserRoutes = require ('../routes/historyMovement_route.js')

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000';
        this.middlewares();
        this.routes(); // Cargar las rutas aquí
        this.dbConnect(); // Solo conectarse a la base de datos aquí
        this.listen();
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto ' + this.port);
        });
    }

    routes() {
        // Agregar rutas de autenticación y creación de usuarios
        this.app.use('/api', authenticateRoute);
        this.app.use('/api', adminPermisoRoutes);
        this.app.use('/api', adminCuentaRoutes);
        this.app.use('/api', movementUserRoutes);
        this.app.use('/api', movementhistoryUserRoutes);

    }

    middlewares() {
        // Parsear JSON
        this.app.use(express.json());

        // Configurar CORS
        this.app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:4200'], // Orígenes permitidos (Angular y otros frontends)
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
            allowedHeaders: ['Content-Type', 'Authorization', 'access-token'] // Agregar 'access-token' para autenticación
        }));
    }

    async dbConnect() {
        try {
            await sequelize.authenticate(); // Conectar a la base de datos
            console.log('Conexión a la base de datos exitosa');
        } catch (error) {
            console.error('No se pudo conectar a la base de datos:', error);
        }
    }
}

module.exports = Server;