const { DataTypes } = require('sequelize');
const connection = require('../config/database');

// Definir el modelo AdminPermiso
const AdminPermiso = connection.define('AdminPermiso', {
    id_admin_permiso: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_permiso: DataTypes.STRING
}, {
    tableName: 'admin_permisos',
    timestamps: false
});

module.exports = AdminPermiso;