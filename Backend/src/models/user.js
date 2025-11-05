const { DataTypes } = require('sequelize');
const connection = require('../config/database');

const sequelize = connection.sequelize;

const User = sequelize.define('User', {
	id: {
		type: DataTypes.INTEGER.UNSIGNED,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(100),
		allowNull: false
	},
	email: {
		type: DataTypes.STRING(150),
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true
		}
	},
	password: {
		type: DataTypes.STRING(255),
		allowNull: false
	},
	role: {
		type: DataTypes.STRING(50),
		allowNull: false,
		defaultValue: 'User'
	},
	otpCode: {
		type: DataTypes.STRING(6),
		allowNull: true
	},
	otpExpires: {
		type: DataTypes.DATE,
		allowNull: true
	},

}, {
	tableName: 'users',
	timestamps: false
});

module.exports = User;