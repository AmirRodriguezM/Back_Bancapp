const Usuario = require('../models/authentication_models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/token_util');

exports.login = async (req, res) => {
    const { nombre_ingreso_usuario, clave_ingreso_usuario } = req.body;

    try {
        const user = await Usuario.findOne({ where: { nombre_ingreso_usuario } });

        if (!user) {
            return res.status(401).json({ error: "El usuario o contraseña son incorrectos" });
        }

        const validPassword = await bcrypt.compare(clave_ingreso_usuario, user.clave_ingreso_usuario);
        
        if (validPassword) {
            if (user.estado_usuario === 'activo') {
                const token = generateToken(user, { expiresIn: '24h' });
                const userType = user.id_rol === 2 ? 'Administrador' : 'Usuario';

                return res.json({
                    success: true,
                    message: "Inicio de sesión exitoso",
                    token,
                    userType
                });
            } else {
                return res.status(403).json({ error: "El usuario no está activo. Contacte al administrador." });
            }
        } else {
            return res.status(401).json({ error: "El usuario o contraseña son incorrectos" });
        }
    } catch (error) {
        console.error("Error en el controlador de login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};