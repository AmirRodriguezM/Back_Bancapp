const Transaccion = require('../models/transaccion_model');
const CuentaAhorro = require('../models/cuenta_ahorro_model');
const Usuario = require('../models/authentication_models');
const sequelize = require('../config/database');

// Función para realizar una transferencia entre cuentas con verificación
exports.realizarTransferencia = async (req, res) => {
    const { monto, numero_cuenta_destino, codigo_verificacion } = req.body;
    const id_usuario = req.user.id; // Obtener el ID del usuario desde el token

    try {
        // Validar que el monto sea positivo
        if (monto <= 0) {
            return res.status(422).json({ error: "El monto debe ser positivo", codigo_error: 1001 });
        }

        // Verificar que el usuario existe y tiene una cuenta de ahorro asignada
        const usuario = await Usuario.findByPk(id_usuario, {
            include: {
                model: CuentaAhorro,
                attributes: ['id_cuenta_ahorro', 'numero_cuenta', 'saldo_cuenta', 'codigo_verificacion_cuenta']
            }
        });

        if (!usuario || !usuario.CuentaAhorro) {
            return res.status(404).json({ error: "Usuario o cuenta de ahorro no encontrados", codigo_error: 1002 });
        }

        const cuentaOrigen = usuario.CuentaAhorro;

        // Verificar que la cuenta tiene saldo suficiente para la transferencia
        if (cuentaOrigen.saldo_cuenta < monto) {
            return res.status(409).json({ error: "Saldo insuficiente para realizar la transferencia", codigo_error: 1003 });
        }

        // Verificar si el código de verificación es correcto
        const esCodigoCorrecto = cuentaOrigen.codigo_verificacion_cuenta === codigo_verificacion;

        if (!esCodigoCorrecto) {
            // Registrar transacción fallida
            await Transaccion.create({
                id_cuenta_ahorro: cuentaOrigen.id_cuenta_ahorro,
                tipo_transaccion: 'error',
                monto: 0, // No afecta el saldo
                fecha_transaccion: new Date(),
                descripcion: `Error en la transferencia: Código de verificación incorrecto`
            });

            return res.status(403).json({
                error: "Código de verificación incorrecto",
                codigo_error: 1006
            });
        }

        // Verificar que la cuenta de destino no sea la misma que la cuenta de origen
        if (cuentaOrigen.numero_cuenta === numero_cuenta_destino) {
            return res.status(403).json({ error: "No puede transferir dinero a la misma cuenta", codigo_error: 1004 });
        }

        // Buscar la cuenta de destino usando el número de cuenta proporcionado
        const cuentaDestino = await CuentaAhorro.findOne({
            where: { numero_cuenta: numero_cuenta_destino }
        });

        // Iniciar una transacción de Sequelize para asegurar atomicidad
        await sequelize.transaction(async (t) => {
            // Crear la transacción en la cuenta de origen
            const transaccionOrigen = await Transaccion.create({
                id_cuenta_ahorro: cuentaOrigen.id_cuenta_ahorro,
                tipo_transaccion: 'transferencia',
                monto: -monto, // Registrar monto negativo
                fecha_transaccion: new Date(),
                descripcion: `Transferencia a cuenta ${numero_cuenta_destino}`
            }, { transaction: t });

            // Actualizar saldo de la cuenta de origen
            cuentaOrigen.saldo_cuenta -= monto;
            await cuentaOrigen.save({ transaction: t });

            // Si la cuenta de destino existe, registrar la transferencia en la cuenta de destino
            if (cuentaDestino) {
                await Transaccion.create({
                    id_cuenta_ahorro: cuentaDestino.id_cuenta_ahorro,
                    tipo_transaccion: 'transferencia',
                    monto: monto,
                    fecha_transaccion: new Date(),
                    descripcion: `Transferencia recibida de cuenta ${cuentaOrigen.numero_cuenta}`
                }, { transaction: t });

                cuentaDestino.saldo_cuenta += monto;
                await cuentaDestino.save({ transaction: t });
            }

            // Responder con los detalles de la transacción creada y los saldos actualizados
            res.status(201).json({
                success: true,
                message: "Transferencia realizada exitosamente",
                transaccion_origen: {
                    id_transaccion: transaccionOrigen.id_transaccion,
                    tipo_transaccion: transaccionOrigen.tipo_transaccion,
                    monto: transaccionOrigen.monto,
                    fecha_transaccion: transaccionOrigen.fecha_transaccion,
                    descripcion: transaccionOrigen.descripcion
                },
                saldo_actualizado_origen: cuentaOrigen.saldo_cuenta,
                saldo_actualizado_destino: cuentaDestino ? cuentaDestino.saldo_cuenta : null
            });
        });
    } catch (error) {
        console.error("Error al crear la transacción de transferencia:", error);
        res.status(500).json({ error: "Error interno del servidor", codigo_error: 1005 });
    }
};
