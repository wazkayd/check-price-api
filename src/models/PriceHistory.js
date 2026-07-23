const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriceHistory = sequelize.define(
  'PriceHistory',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    productPriceId: {
      type: DataTypes.STRING,
      allowNull: false,
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
    },
    changedById: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    changeType: {
      type: DataTypes.ENUM('CREATED', 'UPDATED'),
      allowNull: false,
    },
  },
  {
    tableName: 'PriceHistory',
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
  }
);

PriceHistory.prototype.toPublicJSON = function toPublicJSON() {
  return {
    id: this.id,
    productPriceId: this.productPriceId,
    productId: this.productId,
    storeId: this.storeId,
    price: Number(this.price),
    currency: this.currency,
    changedById: this.changedById,
    changeType: this.changeType,
    createdAt: this.createdAt,
  };
};

module.exports = PriceHistory;
