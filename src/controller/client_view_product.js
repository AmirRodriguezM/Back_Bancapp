const dayjs = require('dayjs');
const Transaccion = require('../models/transaccion_model');
const CuentaAhorro = require('../models/cuenta_ahorro_model');
const Usuario = require('../models/authentication_models');
const sequelize = require('../config/database');

// Función para verificar que la cuenta de ahorro pertenece al usuario
const verificarUsuarioCuenta = async (id_usuario, id_cuenta_ahorro) => {
    const usuario = await Usuario.findByPk(id_usuario, {
        include: [{
            model: CuentaAhorro,
            where: { id_cuenta_ahorro }
        }]
    });
    return usuario ? usuario.CuentaAhorro : null;
};

// Obtener información de la cuenta de ahorro del usuario autenticado
exports.obtenerCuentaAhorro = async (req, res) => {
    const id_usuario = req.user.id;

    try {
        const usuario = await Usuario.findByPk(id_usuario, {
            include: {
                model: CuentaAhorro,
                attributes: ['id_cuenta_ahorro', 'numero_cuenta', 'saldo_cuenta', 'fecha_apertura_cuenta', 'fecha_expiracion_cuenta', 'codigo_verificacion_cuenta']
            }
        });

        if (!usuario || !usuario.CuentaAhorro) {
            return res.status(404).json({ error: "No se encontró la cuenta de ahorro del usuario." });
        }

        const cuenta = usuario.CuentaAhorro;

        res.status(200).json({
            id_cuenta_ahorro: cuenta.id_cuenta_ahorro,
            numero_cuenta: cuenta.numero_cuenta,
            saldo_cuenta: cuenta.saldo_cuenta,
            fecha_apertura_cuenta: cuenta.fecha_apertura_cuenta,
            fecha_expiracion_cuenta: cuenta.fecha_expiracion_cuenta,
            codigo_verificacion_cuenta: cuenta.codigo_verificacion_cuenta
        });
    } catch (error) {
        console.error("Error al obtener los datos de la cuenta de ahorro:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// Realizar un depósito en la cuenta del usuario autenticado
exports.realizarDeposito = async (req, res) => {
    const { monto } = req.body;
    const id_usuario = req.user.id;

    if (monto <= 0) {
        return res.status(400).json({ error: "El monto debe ser mayor a cero" });
    }

    try {
        await sequelize.transaction(async (t) => {
            const usuario = await Usuario.findByPk(id_usuario, { include: { model: CuentaAhorro } });

            if (!usuario || !usuario.CuentaAhorro) {
                return res.status(404).json({ error: "Usuario o cuenta de ahorro no encontrados" });
            }

            const cuenta = usuario.CuentaAhorro;
            const fechaTransaccion = new Date(); // Almacenamos como objeto Date

            const nuevaTransaccion = await Transaccion.create({
                id_cuenta_ahorro: cuenta.id_cuenta_ahorro,
                tipo_transaccion: 'deposito',
                monto,
                fecha_transaccion: fechaTransaccion
            }, { transaction: t });

            cuenta.saldo_cuenta += monto;
            await cuenta.save({ transaction: t });

            res.status(201).json({
                success: true,
                message: "Depósito realizado exitosamente",
                transaccion: {
                    id_transaccion: nuevaTransaccion.id_transaccion,
                    tipo_transaccion: nuevaTransaccion.tipo_transaccion,
                    monto: nuevaTransaccion.monto,
                    fecha_transaccion: nuevaTransaccion.fecha_transaccion
                },
                saldo_actualizado: cuenta.saldo_cuenta
            });
        });
    } catch (error) {
        console.error("Error al realizar el depósito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Realizar un retiro en la cuenta del usuario autenticado
exports.realizarRetiro = async (req, res) => {
    const { monto } = req.body;
    const id_usuario = req.user.id;  // Obtiene el ID del usuario desde el token

    if (monto <= 0) {
        return res.status(400).json({ error: "El monto debe ser mayor a cero" });
    }

    try {
        await sequelize.transaction(async (t) => {
            // Buscar el usuario y su cuenta de ahorro asociada
            const usuario = await Usuario.findByPk(id_usuario, {
                include: {
                    model: CuentaAhorro
                }
            });

            if (!usuario || !usuario.CuentaAhorro) {
                return res.status(404).json({ error: "Usuario o cuenta de ahorro no encontrados" });
            }

            const cuenta = usuario.CuentaAhorro;

            // Verificar que hay suficiente saldo para el retiro
            if (cuenta.saldo_cuenta < monto) {
                return res.status(400).json({ error: "Saldo insuficiente para realizar el retiro" });
            }

            // Crear una transacción de tipo retiro
            const nuevaTransaccion = await Transaccion.create({
                id_cuenta_ahorro: cuenta.id_cuenta_ahorro,
                tipo_transaccion: 'retiro',
                monto,
                fecha_transaccion: new Date()
            }, { transaction: t });

            // Actualizar el saldo de la cuenta
            cuenta.saldo_cuenta -= monto;
            await cuenta.save({ transaction: t });

            res.status(201).json({
                success: true,
                message: "Retiro realizado exitosamente",
                transaccion: {
                    id_transaccion: nuevaTransaccion.id_transaccion,
                    tipo_transaccion: nuevaTransaccion.tipo_transaccion,
                    monto: nuevaTransaccion.monto,
                    fecha_transaccion: nuevaTransaccion.fecha_transaccion
                },
                saldo_actualizado: cuenta.saldo_cuenta
            });
        });
    } catch (error) {
        console.error("Error al realizar el retiro:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};