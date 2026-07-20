const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoreAgent = sequelize.define(
  'StoreAgent',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    storeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    assignedById: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'StoreAgent',
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['storeId', 'userId'],
      },
    ],
  }
);

StoreAgent.prototype.toPublicJSON = function toPublicJSON() {
  const assignment = {
    id: this.id,
    storeId: this.storeId,
    userId: this.userId,
    assignedAt: this.assignedAt,
    assignedById: this.assignedById,
  };

  if (this.user) {
    assignment.user = {
      id: this.user.id,
      fullName: this.user.fullName,
      email: this.user.email,
      role: this.user.role,
    };
  }

  return assignment;
};

module.exports = StoreAgent;
