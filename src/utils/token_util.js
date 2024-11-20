const jwt = require('jsonwebtoken');

// Función para generar un token JWT
const generateToken = (user, options) => {
    return jwt.sign({
        _id: user.id,
        nombre_usuario: user.nombre_usuario,
        apellido_usuario: user.apellido_usuario,
        nombre_ingreso_usuario: user.nombre_ingreso_usuario,
        estado_usuario: user.estado_usuario,
        id_rol: user.id_rol,
        id_admin_permiso: user.id_admin_permiso,
        clave_ingreso_usuario: user.clave_ingreso_usuario
    }, process.env.SECRET, options);
};

module.exports = { generateToken };
