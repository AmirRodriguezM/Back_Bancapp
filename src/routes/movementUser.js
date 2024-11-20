// routes/movementUser.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controller/validate_tokken'); 
const { obtenerCuentaAhorro, realizarDeposito, realizarRetiro } = require('../controller/client_view_product');
const { realizarTransferencia } = require('../controller/create_transaction');


// Endpoints para operaciones del usuario

// Obtener información de la cuenta de ahorro del usuario autenticado
router.get('/miCuenta', verifyToken, obtenerCuentaAhorro);

// Realizar un depósito en la cuenta del usuario autenticado
router.post('/miDeposito', verifyToken, realizarDeposito);

// Realizar un retiro en la cuenta del usuario autenticado
router.post('/miRetiro', verifyToken, realizarRetiro);

router.post('/miTransferencia', verifyToken, realizarTransferencia);

module.exports = router;