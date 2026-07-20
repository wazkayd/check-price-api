const { Op } = require('sequelize');
const { Store, StoreAgent, User } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const STORE_FIELDS = [
  'name',
  'description',
  'address',
  'city',
  'state',
  'country',
  'postalCode',
  'latitude',
  'longitude',
  'phoneNumber',
  'email',
  'status',
];

async function getStoreOr404(id) {
  const store = await Store.findByPk(id);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  return store;
}

function canViewStore(store, user) {
  if (store.isVerified && store.status === 'VERIFIED') {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  return false;
}

async function canManageStore(store, user) {
  if (user.role === 'ADMIN') {
    return true;
  }

  if (user.role !== 'STORE_AGENT') {
    return false;
  }

  const assignment = await StoreAgent.findOne({
    where: { storeId: store.id, userId: user.id },
  });

  return Boolean(assignment);
}

async function listStores(req, res, next) {
  try {
    const { city, status, verified, all } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    const where = {};

    if (city) {
      where.city = { [Op.iLike]: city };
    }

    if (status) {
      where.status = status;
    }

    if (verified === 'true') {
      where.isVerified = true;
    } else if (verified === 'false') {
      where.isVerified = false;
    }

    if (all !== 'true' || !isAdmin) {
      where.isVerified = true;
      where.status = 'VERIFIED';
    }

    const stores = await Store.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return sendSuccess(res, {
      message: 'Stores retrieved successfully',
      data: stores.map((store) => store.toPublicJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

async function getStore(req, res, next) {
  try {
    const store = await getStoreOr404(req.params.id);

    if (!canViewStore(store, req.user)) {
      const hasAccess = req.user ? await canManageStore(store, req.user) : false;

      if (!hasAccess) {
        throw new AppError('Store not found', 404);
      }
    }

    return sendSuccess(res, {
      message: 'Store retrieved successfully',
      data: store.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function createStore(req, res, next) {
  try {
    const payload = {};

    STORE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    const store = await Store.create(payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Store created successfully',
      data: store.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateStore(req, res, next) {
  try {
    const store = await getStoreOr404(req.params.id);

    if (!(await canManageStore(store, req.user))) {
      throw new AppError('You do not have permission to update this store', 403);
    }

    if (req.user.role !== 'ADMIN') {
      delete req.body.status;
      delete req.body.isVerified;
    }

    STORE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    await store.save();

    return sendSuccess(res, {
      message: 'Store updated successfully',
      data: store.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteStore(req, res, next) {
  try {
    const store = await getStoreOr404(req.params.id);
    await store.destroy();

    return sendSuccess(res, {
      message: 'Store deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    return next(error);
  }
}

async function verifyStore(req, res, next) {
  try {
    const store = await getStoreOr404(req.params.id);

    store.isVerified = true;
    store.status = 'VERIFIED';
    await store.save();

    return sendSuccess(res, {
      message: 'Store verified successfully',
      data: store.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function rejectStore(req, res, next) {
  try {
    const store = await getStoreOr404(req.params.id);

    store.isVerified = false;
    store.status = 'REJECTED';
    await store.save();

    return sendSuccess(res, {
      message: 'Store rejected successfully',
      data: store.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function listStoreAgents(req, res, next) {
  try {
    await getStoreOr404(req.params.id);

    const assignments = await StoreAgent.findAll({
      where: { storeId: req.params.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'role'],
        },
      ],
      order: [['assignedAt', 'DESC']],
    });

    return sendSuccess(res, {
      message: 'Store agents retrieved successfully',
      data: assignments.map((assignment) => assignment.toPublicJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

async function assignStoreAgent(req, res, next) {
  try {
    const store = await getStoreOr404(req.params.id);
    const user = await User.findByPk(req.body.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Administrators cannot be assigned as store agents', 400);
    }

    const existingAssignment = await StoreAgent.findOne({
      where: {
        storeId: store.id,
        userId: user.id,
      },
    });

    if (existingAssignment) {
      throw new AppError('User is already assigned to this store', 409);
    }

    const assignment = await StoreAgent.create({
      storeId: store.id,
      userId: user.id,
      assignedById: req.user.id,
    });

    if (user.role === 'USER') {
      user.role = 'STORE_AGENT';
      await user.save();
    }

    await assignment.reload({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'role'],
        },
      ],
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Store agent assigned successfully',
      data: assignment.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function removeStoreAgent(req, res, next) {
  try {
    await getStoreOr404(req.params.id);

    const assignment = await StoreAgent.findOne({
      where: {
        storeId: req.params.id,
        userId: req.params.userId,
      },
    });

    if (!assignment) {
      throw new AppError('Store agent assignment not found', 404);
    }

    await assignment.destroy();

    const remainingAssignments = await StoreAgent.count({
      where: { userId: req.params.userId },
    });

    if (remainingAssignments === 0) {
      const user = await User.findByPk(req.params.userId);

      if (user && user.role === 'STORE_AGENT') {
        user.role = 'USER';
        await user.save();
      }
    }

    return sendSuccess(res, {
      message: 'Store agent removed successfully',
      data: {
        storeId: req.params.id,
        userId: req.params.userId,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  verifyStore,
  rejectStore,
  listStoreAgents,
  assignStoreAgent,
  removeStoreAgent,
};
