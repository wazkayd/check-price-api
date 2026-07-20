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

module.exports = {
  authorize,
  requireStoreAgentAccess,
  requireStoreManagementAccess,
};
