const AdminPermiso = require('../models/admin_permiso_models');
const Usuario = require('../models/authentication_models');
const bcrypt = require('bcrypt');


exports.obtenerPermisosUsuarios = async (req, res) => {
    try {
        const userRole = req.user.id_rol; // Extraer el rol del usuario del token

        let permisosUsuarios;

        if (userRole === 2) { // Rol 2 significa Administrador
            // Administrador puede ver los permisos de todos los usuarios, tanto clientes como administradores
            permisosUsuarios = await AdminPermiso.findAll({
                attributes: ['id_admin_permiso', 'tipo_permiso'],
                include: [{
                    model: Usuario,
                    attributes: [
                        'id',
                        'nombre_usuario',
                        'apellido_usuario',
                        'nombre_ingreso_usuario',
                        'estado_usuario',
                        'id_rol',
                        'clave_ingreso_usuario',
                        'id_admin_permiso'
                    ]
                }]
            });
        } else if (userRole === 1) { // Rol 1 significa Cliente
            // Cliente solo ve sus propios permisos
            permisosUsuarios = await AdminPermiso.findAll({
                attributes: ['id_admin_permiso', 'tipo_permiso'],
                include: [{
                    model: Usuario,
                    attributes: [
                        'id',
                        'nombre_usuario',
                        'apellido_usuario',
                        'nombre_ingreso_usuario',
                        'estado_usuario',
                        'id_rol',
                        'id_admin_permiso'
                    ],
                    where: { id: req.user.id_usuario } // Filtrar solo los datos del usuario actual
                }]
            });
        } else {
            return res.status(403).json({ error: 'Rol de usuario no autorizado' });
        }

        res.json(permisosUsuarios);
    } catch (error) {
        console.error("Error al obtener permisos y usuarios asociados:", error);
        res.status(500).json({ error: 'Error al obtener permisos y usuarios asociados' });
    }
};


exports.crearUsuario = async (req, res) => {
    const { nombre_usuario, apellido_usuario, nombre_ingreso_usuario, clave_ingreso_usuario, estado_usuario, id_rol, id_admin_permiso } = req.body;

    try {
        const existingUser = await Usuario.findOne({ where: { nombre_ingreso_usuario } });
        if (existingUser) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
        }

        const hashedPassword = await bcrypt.hash(clave_ingreso_usuario, 10);

        // Crear el nuevo usuario
        await Usuario.create({
            nombre_usuario,
            apellido_usuario,
            nombre_ingreso_usuario,
            clave_ingreso_usuario: hashedPassword,
            estado_usuario,
            id_rol,
            id_admin_permiso
        });

        const userType = id_rol === 2 ? 'Administrador' : 'Usuario';

        return res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            userType
        });
    } catch (error) {
        console.error("Error en el controlador de creación de usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.editUser = async (req, res) => {
    const { id } = req.params;
    const { clave_ingreso_usuario, ...updatedFields } = req.body; // Extraer la contraseña por separado

    try {
        const user = await Usuario.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Convertir el objeto de la base de datos y el objeto de los nuevos campos a strings JSON para comparar
        const currentUserData = {
            nombre_usuario: user.nombre_usuario,
            apellido_usuario: user.apellido_usuario,
            nombre_ingreso_usuario: user.nombre_ingreso_usuario,
            estado_usuario: user.estado_usuario,
            id_rol: user.id_rol,
            id_admin_permiso: user.id_admin_permiso
        };

        const updatedUserData = { ...updatedFields };

        // Verificar si hay alguna diferencia en los campos
        if (JSON.stringify(currentUserData) === JSON.stringify(updatedUserData) && !clave_ingreso_usuario) {
            return res.status(200).json({
                success: false,
                message: "No se realizaron cambios ya que los datos son los mismos"
            });
        }

        // Encriptar la contraseña si se proporciona y es diferente de la actual
        let hashedPassword = user.clave_ingreso_usuario;
        if (clave_ingreso_usuario && !(await bcrypt.compare(clave_ingreso_usuario, user.clave_ingreso_usuario))) {
            hashedPassword = await bcrypt.hash(clave_ingreso_usuario, 10);
            updatedUserData.clave_ingreso_usuario = hashedPassword;
        }

        // Actualizar los campos
        await user.update(updatedUserData);

        return res.status(200).json({
            success: true,
            message: "Usuario actualizado exitosamente"
        });
    } catch (error) {
        console.error("Error en el controlador de edición de usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Usuario.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Eliminar el usuario
        await user.destroy();

        return res.status(200).json({
            success: true,
            message: "Usuario eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error en el controlador de eliminación de usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
