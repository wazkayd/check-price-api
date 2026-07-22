const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'Product',
    freezeTableName: true,
    timestamps: true,
  }
);

Product.prototype.toPublicJSON = function toPublicJSON({ includeTimestamps = true, includeImages = false } = {}) {
  const product = {
    id: this.id,
    name: this.name,
    description: this.description,
    sku: this.sku,
    brand: this.brand,
    categoryId: this.categoryId,
    isAvailable: this.isAvailable,
  };

  if (this.category) {
    product.category = this.category.toPublicJSON({ includeTimestamps: false });
  }

  if (includeImages && this.images) {
    product.images = this.images.map((image) => image.toPublicJSON());
  }

  if (includeTimestamps) {
    product.createdAt = this.createdAt;
    product.updatedAt = this.updatedAt;
  }

  return product;
};

module.exports = Product;
