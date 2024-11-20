// controller/cuenta_ahorro_controller.js
const CuentaAhorro = require('../models/cuenta_ahorro_model'); // Modelo de CuentaAhorro
const Usuario = require('../models/authentication_models');

// Función para crear una nueva cuenta de ahorro
exports.crearCuentaAhorro = async (req, res) => {
    try {
        const { numero_cuenta, saldo_cuenta, fecha_apertura_cuenta, fecha_expiracion_cuenta, codigo_verificacion_cuenta } = req.body;
        const nuevaCuenta = await CuentaAhorro.create({
            numero_cuenta,
            saldo_cuenta,
            fecha_apertura_cuenta,
            fecha_expiracion_cuenta,
            codigo_verificacion_cuenta
        });
        res.status(201).json(nuevaCuenta);
    } catch (error) {
        console.error("Error en crearCuentaAhorro:", error);  // Log para detalles del error
        res.status(500).json({ error: 'Error al crear la cuenta de ahorro' });
    }
};

// Función para obtener todas las cuentas de ahorro
exports.obtenerCuentasAhorro = async (req, res) => {
    try {
        const cuentas = await CuentaAhorro.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['id', 'nombre_usuario', 'apellido_usuario']  // Campos específicos que deseas del Usuario
                }
            ]
        });

        res.status(200).json(cuentas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para actualizar una cuenta de ahorro
exports.actualizarCuentaAhorro = async (req, res) => {
    try {
        const { id } = req.params;
        const cuenta = await CuentaAhorro.findByPk(id);
        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta de ahorro no encontrada' });
        }
        const { numero_cuenta, saldo_cuenta, fecha_apertura_cuenta, fecha_expiracion_cuenta, codigo_verificacion_cuenta } = req.body;
        await cuenta.update({
            numero_cuenta,
            saldo_cuenta,
            fecha_apertura_cuenta,
            fecha_expiracion_cuenta,
            codigo_verificacion_cuenta
        });
        res.status(200).json(cuenta);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la cuenta de ahorro' });
    }
};

// Función para eliminar una cuenta de ahorro
exports.eliminarCuentaAhorro = async (req, res) => {
    try {
        const { id } = req.params;
        const cuenta = await CuentaAhorro.findByPk(id);
        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta de ahorro no encontrada' });
        }
        await cuenta.destroy();
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la cuenta de ahorro' });
    }
};
