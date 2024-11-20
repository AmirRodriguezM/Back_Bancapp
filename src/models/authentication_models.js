const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const connection = require('../config/database');
const AdminPermiso = require('./admin_permiso_models');
const CuentaAhorro = require('./cuenta_ahorro_model');
const UsuarioRol = require('./usuario_rol_model'); 

const Usuario = connection.define('Usuario', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    nombre_usuario: DataTypes.STRING,
    apellido_usuario: DataTypes.STRING,
    nombre_ingreso_usuario: {
        type: DataTypes.STRING,
        unique: true
    },
    clave_ingreso_usuario: DataTypes.STRING,
    estado_usuario: DataTypes.STRING,
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UsuarioRol,
            key: 'id_rol'
        }
    },
    id_admin_permiso: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AdminPermiso,
            key: 'id_admin_permiso'
        }
    },
    id_cuenta_ahorro: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
        references: {
            model: CuentaAhorro,
            key: 'id_cuenta_ahorro'
        }
    }
}, {
    tableName: 'usuario',
    timestamps: false
});

// Definir las relaciones
Usuario.belongsTo(UsuarioRol, { foreignKey: 'id_rol' });
Usuario.belongsTo(AdminPermiso, { foreignKey: 'id_admin_permiso' });
Usuario.belongsTo(CuentaAhorro, { foreignKey: 'id_cuenta_ahorro' });

UsuarioRol.hasMany(Usuario, { foreignKey: 'id_rol' });
AdminPermiso.hasMany(Usuario, { foreignKey: 'id_admin_permiso' });
CuentaAhorro.hasOne(Usuario, { foreignKey: 'id_cuenta_ahorro' });

Usuario.encryptClave = async (clave) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
};

module.exports = Usuario;
