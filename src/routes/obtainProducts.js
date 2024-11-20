const express = require('express');
const router = express.Router();
const { obtenerCuentasAhorro, crearCuentaAhorro, actualizarCuentaAhorro, eliminarCuentaAhorro} = require('../controller/create_product_controller');
const { verifyToken, verifyAdmin } = require('../controller/validate_tokken');

router.get('/obtenerCuenta', verifyToken, verifyAdmin, obtenerCuentasAhorro);
router.post('/crearCuenta', verifyToken, verifyAdmin, crearCuentaAhorro);
router.put('/actualizarCuenta/:id', verifyToken, verifyAdmin, actualizarCuentaAhorro);
router.delete('/eliminarCuenta/:id', verifyToken, verifyAdmin, eliminarCuentaAhorro);

module.exports = router;
