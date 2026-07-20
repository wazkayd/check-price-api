const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define(
  'Store',
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
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'Store',
    freezeTableName: true,
    timestamps: true,
  }
);

Store.prototype.toPublicJSON = function toPublicJSON({ includeTimestamps = true } = {}) {
  const store = {
    id: this.id,
    name: this.name,
    description: this.description,
    address: this.address,
    city: this.city,
    state: this.state,
    country: this.country,
    postalCode: this.postalCode,
    latitude: this.latitude !== null ? Number(this.latitude) : null,
    longitude: this.longitude !== null ? Number(this.longitude) : null,
    phoneNumber: this.phoneNumber,
    email: this.email,
    status: this.status,
    isVerified: this.isVerified,
  };

  if (includeTimestamps) {
    store.createdAt = this.createdAt;
    store.updatedAt = this.updatedAt;
  }

  return store;
};

module.exports = Store;
