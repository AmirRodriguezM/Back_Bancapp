// usuario_rol_model.js
const { DataTypes } = require('sequelize');
const connection = require('../config/database');

const UsuarioRol = connection.define('UsuarioRol', {
    id_rol: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true 
    }
}, {
    tableName: 'usuario_rol',
    timestamps: false
});     

module.exports = UsuarioRol;
