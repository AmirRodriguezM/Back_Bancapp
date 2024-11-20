const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const Usuario = require('../models/authentication_models');
const Transaccion = require('../models/transaccion_model');
const CuentaAhorro = require('../models/cuenta_ahorro_model');

exports.obtenerHistorialTransacciones = async (req, res) => {
    const id_usuario = req.user.id;

    try {
        const usuario = await Usuario.findByPk(id_usuario, {
            include: {
                model: CuentaAhorro,
                attributes: ['id_cuenta_ahorro']
            }
        });

        if (!usuario || !usuario.CuentaAhorro) {
            return res.status(404).json({ error: "Usuario o cuenta de ahorro no encontrados" });
        }

        const cuenta = usuario.CuentaAhorro;

        const transacciones = await Transaccion.findAll({
            where: { id_cuenta_ahorro: cuenta.id_cuenta_ahorro },
            order: [['fecha_transaccion', 'DESC']],
            raw: true
        });

        // Convertir la fecha a la zona horaria de Colombia y devolverla en el formato deseado
        const historial = transacciones.map((transaccion) => ({
            ...transaccion,
            fecha_transaccion: dayjs(transaccion.fecha_transaccion)
                .tz('America/Bogota')
                .format('YYYY-MM-DD HH:mm:ss')
        }));

        res.status(200).json({
            success: true,
            historial
        });
    } catch (error) {
        console.error("Error al obtener el historial de transacciones:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
