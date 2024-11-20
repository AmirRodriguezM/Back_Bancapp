const express = require('express');
const router = express.Router();
const { obtenerPermisosUsuarios, crearUsuario, editUser, deleteUser } = require('../controller/admin_permiso_controller');
const { obtenerClientes, editUserClient, deleteUserClient } = require('../controller/obtain_client_user_controller');
const { verifyToken, verifyAdmin } = require('../controller/validate_tokken'); 

// Rutas para vista de administradores
router.post('/consultarPermisosUsuarios', verifyToken, verifyAdmin, obtenerPermisosUsuarios);
router.post('/crearUsuario', verifyToken, verifyAdmin, crearUsuario);
router.put('/editarUsuario/:id', verifyToken, verifyAdmin, editUser); 
router.delete('/eliminarUsuario/:id', verifyToken, verifyAdmin, deleteUser); 

// Rutas para gestionar clientes
router.post('/consultarUsuariosClientes', verifyToken, verifyAdmin, obtenerClientes); 
router.put('/editarUsuarioCliente/:id', verifyToken, verifyAdmin, editUserClient); 
router.delete('/eliminarUsuarioCliente/:id', verifyToken, verifyAdmin, deleteUserClient);

module.exports = router;
