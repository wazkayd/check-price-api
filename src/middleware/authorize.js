const AppError = require('../utils/AppError');
const { StoreAgent } = require('../models');

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    return next();
  };
}

async function requireStoreAgentAccess(req, _res, next) {
  try {
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'STORE_AGENT') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const assignment = await StoreAgent.findOne({
      where: {
        storeId: req.params.id,
        userId: req.user.id,
      },
    });

    if (!assignment) {
      return next(new AppError('You are not assigned to this store', 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function requireStoreManagementAccess(req, res, next) {
  if (req.user?.role === 'ADMIN') {
    return next();
  }

  return requireStoreAgentAccess(req, res, next);
}

function authorizeCatalogManager(req, res, next) {
  return authorize('ADMIN', 'STORE_AGENT')(req, res, next);
}

async function userCanManageStore(user, storeId) {
  if (user.role === 'ADMIN') {
    return true;
  }

  if (user.role !== 'STORE_AGENT') {
    return false;
  }

  const assignment = await StoreAgent.findOne({
    where: {
      storeId,
      userId: user.id,
    },
  });

  return Boolean(assignment);
}

async function requirePriceManagementAccess(req, _res, next) {
  try {
    let storeId = req.body.storeId;

    if (!storeId && req.params.id) {
      const { ProductPrice } = require('../models');
      const productPrice = await ProductPrice.findByPk(req.params.id);

      if (!productPrice) {
        return next(new AppError('Price not found', 404));
      }

      storeId = productPrice.storeId;
      req.productPrice = productPrice;
    }

    if (!storeId) {
      return next(new AppError('storeId is required', 400));
    }

    const allowed = await userCanManageStore(req.user, storeId);

    if (!allowed) {
      return next(new AppError('You do not have permission to manage prices for this store', 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authorize,
  authorizeCatalogManager,
  requireStoreAgentAccess,
  requireStoreManagementAccess,
  userCanManageStore,
  requirePriceManagementAccess,
};
