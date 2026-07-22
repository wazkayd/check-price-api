const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductCategory = sequelize.define(
  'ProductCategory',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'ProductCategory',
    freezeTableName: true,
    timestamps: true,
  }
);

ProductCategory.prototype.toPublicJSON = function toPublicJSON({ includeTimestamps = true } = {}) {
  const category = {
    id: this.id,
    name: this.name,
    description: this.description,
    slug: this.slug,
    isActive: this.isActive,
  };

  if (includeTimestamps) {
    category.createdAt = this.createdAt;
    category.updatedAt = this.updatedAt;
  }

  return category;
};

module.exports = ProductCategory;
