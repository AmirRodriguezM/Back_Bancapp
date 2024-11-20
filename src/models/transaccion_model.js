// models/transaccion_model.js
const { DataTypes } = require('sequelize');
const connection = require('../config/database');
const CuentaAhorro = require('./cuenta_ahorro_model');

const Transaccion = connection.define('Transaccion', {
    id_transaccion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cuenta_ahorro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CuentaAhorro,
            key: 'id_cuenta_ahorro'
        }
    },
    tipo_transaccion: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    fecha_transaccion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'transaccion',
    timestamps: false
});

// Definir relaciones
CuentaAhorro.hasMany(Transaccion, { foreignKey: 'id_cuenta_ahorro' }); // Una cuenta de ahorro tiene múltiples transacciones
Transaccion.belongsTo(CuentaAhorro, { foreignKey: 'id_cuenta_ahorro' }); // Cada transacción pertenece a una cuenta de ahorro

module.exports = Transaccion;
