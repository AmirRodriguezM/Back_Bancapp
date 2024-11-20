const Usuario = require('../models/authentication_models');
const UsuarioRol = require('../models/usuario_rol_model');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

exports.obtenerClientes = async (req, res) => {
    try {
        const clientes = await Usuario.findAll({
            where: { id_rol: 1 }, // Filtrar solo los clientes
            include: [{
                model: UsuarioRol,
                attributes: ['rol'] // Obtener el nombre del rol (cliente o administrador)
            }]
        });

        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener los clientes:", error);
        res.status(500).json({ error: "Error al obtener los clientes" });
    }
};

// Método para editar un usuario
exports.editUserClient = async (req, res) => {
    const { id } = req.params;
    const { clave_ingreso_usuario, id_cuenta_ahorro, id_rol, id_admin_permiso, ...updatedFields } = req.body;

    try {
        const user = await Usuario.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Validación para verificar si la tarjeta de ahorro (id_cuenta_ahorro) ya está en uso
        if (id_cuenta_ahorro) {
            const existingAccountUser = await Usuario.findOne({
                where: { id_cuenta_ahorro, id: { [Op.ne]: id } }
            });
            if (existingAccountUser) {
                return res.status(400).json({
                    success: false,
                    message: "La tarjeta de ahorros ya está asignada a otro usuario"
                });
            }
        }

        // Verificar si id_cuenta_ahorro es 0 o vacío, y asignar null en ese caso
        if (id_cuenta_ahorro === 0 || id_cuenta_ahorro === '') {
            updatedFields.id_cuenta_ahorro = null;
        }

        // Datos actuales del usuario para comparación, excluyendo id, id_rol, y id_admin_permiso
        const currentUserData = {
            nombre_usuario: user.nombre_usuario,
            apellido_usuario: user.apellido_usuario,
            nombre_ingreso_usuario: user.nombre_ingreso_usuario,
            estado_usuario: user.estado_usuario,
            id_cuenta_ahorro: user.id_cuenta_ahorro
        };

        const updatedUserData = { ...updatedFields, id_cuenta_ahorro };

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

// Método para eliminar un usuario
exports.deleteUserClient = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Usuario.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

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
