const { DataTypes } = require('sequelize');
const connection = require('../config/database');

const sequelize = connection.sequelize;

const categories = sequelize.define('categories', {
	id: {
		type: DataTypes.INTEGER.UNSIGNED,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING(100),
		allowNull: false,
		unique: true
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	}
}, {
	tableName: 'categories', // tên bảng trong DB
	timestamps: false
});

module.exports = categories;
