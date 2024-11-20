// models/cuenta_ahorro_model.js
const { DataTypes } = require('sequelize');
const connection = require('../config/database');

const CuentaAhorro = connection.define('CuentaAhorro', {
    id_cuenta_ahorro: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    numero_cuenta: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    saldo_cuenta: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
    },
    fecha_apertura_cuenta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_expiracion_cuenta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    codigo_verificacion_cuenta: {
        type: DataTypes.STRING(3),
        allowNull: true
    }
}, {
    tableName: 'cuenta_ahorro',
    timestamps: false
});

module.exports = CuentaAhorro;
