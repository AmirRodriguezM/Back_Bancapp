const express = require('express');
const router = express.Router();
const authController = require('../controller/authentication_controller'); // Importar el controlador de autenticación
const { verifyToken, verifyAdmin } = require('../controller/validate_tokken'); // Importar los middlewares de verificación

// Agrega este console.log para verificar que el controlador se importa correctamente
console.log("Controller Functions:", authController); // Esto debería mostrar las funciones exportadas

// Ruta para login (no necesita autenticación)
router.post('/login', authController.login);

// Ruta protegida (requiere autenticación y acceso de administrador)
router.get('/protected', verifyToken, verifyAdmin, (req, res) => {
    res.json({ message: "Acceso autorizado a ruta protegida" });
});

module.exports = router;
