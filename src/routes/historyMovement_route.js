// routes/movementUser.js
const express = require('express');
const router = express.Router();
const { obtenerHistorialTransacciones } = require('../controller/historyMovement');
const { verifyToken } = require('../controller/validate_tokken');

// Ruta para obtener el historial de transacciones del usuario autenticado
router.get('/historialTransacciones', verifyToken, obtenerHistorialTransacciones);

module.exports = router;
