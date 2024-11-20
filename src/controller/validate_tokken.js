const jwt = require('jsonwebtoken');

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '¡Lo sentimos!, pero no tiene permisos para acceder a esta ruta.' });
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET);
        
        // Asegurarse de que `req.user.id` siempre tenga el ID del usuario
        req.user = { ...verified, id: verified._id || verified.id }; 
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'El token no es válido o ha expirado.' });
    }
};

// Middleware para verificar que el usuario es administrador
const verifyAdmin = (req, res, next) => {
    if (req.user.id_rol !== 2) { // 2 es el id_rol para administrador
        return res.status(403).json({ error: '¡Acceso denegado! Esta ruta es solo para administradores.' });
    }
    next(); // Permitir acceso si es administrador
};

module.exports = { verifyToken, verifyAdmin };
