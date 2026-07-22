const User = require('./User');
const Store = require('./Store');
const StoreAgent = require('./StoreAgent');
const ProductCategory = require('./ProductCategory');
const Product = require('./Product');
const ProductImage = require('./ProductImage');

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

ProductCategory.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(ProductCategory, { foreignKey: 'categoryId', as: 'category' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  User,
  Store,
  StoreAgent,
  ProductCategory,
  Product,
  ProductImage,
};
