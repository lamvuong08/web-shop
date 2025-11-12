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
		type: DataTypes.ENUM('customer', 'admin'),
		allowNull: false,
		defaultValue: 'customer'
	},
	phone: {
		type: DataTypes.STRING(20),
		allowNull: true
	},
	otpCode: {
		type: DataTypes.STRING(6),
		allowNull: true
	},
	otpExpires: {
		type: DataTypes.DATE,
		allowNull: true
	},
	isVerify: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false // false = chưa xác thực OTP, true = đã xác thực
	}

}, {
	tableName: 'users',
	timestamps: false
});

module.exports = User;