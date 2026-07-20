const User = require('./User');
const Store = require('./Store');
const StoreAgent = require('./StoreAgent');

Store.hasMany(StoreAgent, { foreignKey: 'storeId', as: 'agents' });
StoreAgent.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

StoreAgent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
StoreAgent.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedBy' });

User.belongsToMany(Store, {
  through: StoreAgent,
  foreignKey: 'userId',
  otherKey: 'storeId',
  as: 'assignedStores',
});

Store.belongsToMany(User, {
  through: StoreAgent,
  foreignKey: 'storeId',
  otherKey: 'userId',
  as: 'assignedAgents',
});

module.exports = {
  User,
  Store,
  StoreAgent,
};
