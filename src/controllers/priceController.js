const { Product, Store, ProductPrice, PriceHistory } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { userCanManageStore } = require('../middleware/authorize');
const { isPublicPriceVisible } = require('../utils/publicVisibility');

const priceInclude = [
  {
    model: Product,
    as: 'product',
    attributes: ['id', 'name', 'sku', 'isAvailable'],
  },
  {
    model: Store,
    as: 'store',
    attributes: ['id', 'name', 'city', 'isVerified', 'status'],
  },
];

async function getPriceOr404(id) {
  const productPrice = await ProductPrice.findByPk(id, { include: priceInclude });

  if (!productPrice) {
    throw new AppError('Price not found', 404);
  }

  return productPrice;
}

async function assertPricingTargets(productId, storeId) {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!product.isAvailable) {
    throw new AppError('Product is not available for pricing', 400);
  }

  const store = await Store.findByPk(storeId);

  if (!store) {
    throw new AppError('Store not found', 404);
  }

  if (!store.isVerified || store.status !== 'VERIFIED') {
    throw new AppError('Prices can only be submitted for verified stores', 400);
  }

  return { product, store };
}

async function recordPriceHistory(productPrice, changeType, userId, transaction) {
  await PriceHistory.create(
    {
      productPriceId: productPrice.id,
      productId: productPrice.productId,
      storeId: productPrice.storeId,
      price: productPrice.price,
      currency: productPrice.currency,
      changedById: userId,
      changeType,
    },
    { transaction }
  );
}

async function listPrices(req, res, next) {
  try {
    const { productId, storeId, all } = req.query;
    const canViewAll = all === 'true' && ['ADMIN', 'STORE_AGENT'].includes(req.user?.role);
    const where = {};

    if (productId) {
      where.productId = productId;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    const prices = await ProductPrice.findAll({
      where,
      include: priceInclude,
      order: [['updatedAt', 'DESC']],
    });

    const visiblePrices = canViewAll
      ? prices
      : prices.filter((price) => isPublicPriceVisible(price));

    return sendSuccess(res, {
      message: 'Prices retrieved successfully',
      data: visiblePrices.map((price) => price.toPublicJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPrice(req, res, next) {
  try {
    const productPrice = await getPriceOr404(req.params.id);
    const canViewAll = ['ADMIN', 'STORE_AGENT'].includes(req.user?.role);

    if (!isPublicPriceVisible(productPrice) && !canViewAll) {
      throw new AppError('Price not found', 404);
    }

    if (
      req.user?.role === 'STORE_AGENT' &&
      !(await userCanManageStore(req.user, productPrice.storeId)) &&
      !isPublicPriceVisible(productPrice)
    ) {
      throw new AppError('Price not found', 404);
    }

    return sendSuccess(res, {
      message: 'Price retrieved successfully',
      data: productPrice.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function submitPrice(req, res, next) {
  try {
    const { productId, storeId, price, currency } = req.body;

    await assertPricingTargets(productId, storeId);

    const existingPrice = await ProductPrice.findOne({
      where: { productId, storeId },
    });

    if (existingPrice) {
      throw new AppError(
        'A price already exists for this product at this store. Use PUT /prices/:id to update it.',
        409
      );
    }

    const productPrice = await ProductPrice.sequelize.transaction(async (transaction) => {
      const createdPrice = await ProductPrice.create(
        {
          productId,
          storeId,
          price,
          currency: currency || 'NGN',
          submittedById: req.user.id,
        },
        { transaction }
      );

      await recordPriceHistory(createdPrice, 'CREATED', req.user.id, transaction);

      return createdPrice;
    });

    await productPrice.reload({ include: priceInclude });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Price submitted successfully',
      data: productPrice.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function updatePrice(req, res, next) {
  try {
    const productPrice = req.productPrice || (await getPriceOr404(req.params.id));
    const { price, currency } = req.body;

    await assertPricingTargets(productPrice.productId, productPrice.storeId);

    await ProductPrice.sequelize.transaction(async (transaction) => {
      productPrice.price = price;

      if (currency !== undefined) {
        productPrice.currency = currency;
      }

      await productPrice.save({ transaction });
      await recordPriceHistory(productPrice, 'UPDATED', req.user.id, transaction);
    });

    await productPrice.reload({ include: priceInclude });

    return sendSuccess(res, {
      message: 'Price updated successfully',
      data: productPrice.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPriceHistory(req, res, next) {
  try {
    const productPrice = req.productPrice || (await getPriceOr404(req.params.id));

    const canManage = await userCanManageStore(req.user, productPrice.storeId);

    if (!canManage) {
      throw new AppError('You do not have permission to view price history for this store', 403);
    }

    const history = await PriceHistory.findAll({
      where: { productPriceId: productPrice.id },
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, {
      message: 'Price history retrieved successfully',
      data: history.map((entry) => entry.toPublicJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPrices,
  getPrice,
  submitPrice,
  updatePrice,
  getPriceHistory,
};
