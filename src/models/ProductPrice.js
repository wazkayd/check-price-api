const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductPrice = sequelize.define(
  'ProductPrice',
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
    storeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
    },
    submittedById: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'ProductPrice',
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['productId', 'storeId'],
      },
    ],
  }
);

ProductPrice.prototype.toPublicJSON = function toPublicJSON({ includeTimestamps = true } = {}) {
  const record = {
    id: this.id,
    productId: this.productId,
    storeId: this.storeId,
    price: Number(this.price),
    currency: this.currency,
    submittedById: this.submittedById,
  };

  if (this.product) {
    record.product = {
      id: this.product.id,
      name: this.product.name,
      sku: this.product.sku,
      isAvailable: this.product.isAvailable,
    };
  }

  if (this.store) {
    record.store = {
      id: this.store.id,
      name: this.store.name,
      city: this.store.city,
      isVerified: this.store.isVerified,
    };
  }

  if (includeTimestamps) {
    record.createdAt = this.createdAt;
    record.updatedAt = this.updatedAt;
  }

  return record;
};

module.exports = ProductPrice;
