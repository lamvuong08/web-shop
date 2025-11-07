const { DataTypes } = require('sequelize');
const connection = require('../config/database');
const categories = require('./categories'); // liên kết với category

const sequelize = connection.sequelize;

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    size: {
        type: DataTypes.ENUM('S', 'M', 'L', 'XL', 'XXL'),
        allowNull: true,
        defaultValue: 'M',
        comment: 'Kích cỡ sản phẩm: S, M, L, XL, XXL'
    }
}, {
    tableName: 'products',
    timestamps: false
});

// Thiết lập quan hệ
categories.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(categories, { foreignKey: 'categoryId' });

module.exports = Product;
