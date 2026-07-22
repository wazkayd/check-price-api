const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define(
  'ProductImage',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'ProductImage',
    freezeTableName: true,
    timestamps: true,
  }
);

ProductImage.prototype.toPublicJSON = function toPublicJSON({ includeTimestamps = true } = {}) {
  const image = {
    id: this.id,
    productId: this.productId,
    url: this.url,
    altText: this.altText,
    isPrimary: this.isPrimary,
    sortOrder: this.sortOrder,
  };

  if (includeTimestamps) {
    image.createdAt = this.createdAt;
    image.updatedAt = this.updatedAt;
  }

  return image;
};

module.exports = ProductImage;
