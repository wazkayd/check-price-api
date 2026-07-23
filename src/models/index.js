const User = require('./User');
const Store = require('./Store');
const StoreAgent = require('./StoreAgent');
const ProductCategory = require('./ProductCategory');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductPrice = require('./ProductPrice');
const PriceHistory = require('./PriceHistory');

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

Product.hasMany(ProductPrice, { foreignKey: 'productId', as: 'prices' });
Store.hasMany(ProductPrice, { foreignKey: 'storeId', as: 'prices' });

ProductPrice.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
ProductPrice.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
ProductPrice.belongsTo(User, { foreignKey: 'submittedById', as: 'submittedBy' });

ProductPrice.hasMany(PriceHistory, { foreignKey: 'productPriceId', as: 'history' });
PriceHistory.belongsTo(ProductPrice, { foreignKey: 'productPriceId', as: 'productPrice' });
PriceHistory.belongsTo(User, { foreignKey: 'changedById', as: 'changedBy' });

module.exports = {
  User,
  Store,
  StoreAgent,
  ProductCategory,
  Product,
  ProductImage,
  ProductPrice,
  PriceHistory,
};
