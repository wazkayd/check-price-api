const { Op } = require('sequelize');
const {
  Product,
  ProductCategory,
  ProductImage,
  ProductPrice,
  Store,
} = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { isPublicPriceVisible, isPublicStoreVisible } = require('../utils/publicVisibility');
const { filterStoresByRadius } = require('../utils/geo');

const verifiedStoreWhere = {
  isVerified: true,
  status: 'VERIFIED',
};

const productInclude = [
  {
    model: ProductCategory,
    as: 'category',
  },
  {
    model: ProductImage,
    as: 'images',
    separate: true,
    order: [
      ['isPrimary', 'DESC'],
      ['sortOrder', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  },
];

const priceInclude = [
  {
    model: Product,
    as: 'product',
    attributes: ['id', 'name', 'sku', 'brand', 'isAvailable'],
  },
  {
    model: Store,
    as: 'store',
    attributes: ['id', 'name', 'city', 'address', 'latitude', 'longitude', 'isVerified', 'status'],
  },
];

async function getAvailableProductOr404(productId) {
  const product = await Product.findOne({
    where: {
      id: productId,
      isAvailable: true,
    },
    include: productInclude,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

async function fetchVisiblePrices({ productId, storeId, city } = {}) {
  const storeWhere = { ...verifiedStoreWhere };

  if (city) {
    storeWhere.city = { [Op.iLike]: city };
  }

  if (storeId) {
    storeWhere.id = storeId;
  }

  const prices = await ProductPrice.findAll({
    where: productId ? { productId } : undefined,
    include: [
      {
        model: Product,
        as: 'product',
        where: { isAvailable: true },
      },
      {
        model: Store,
        as: 'store',
        where: storeWhere,
      },
    ],
    order: [['price', 'ASC']],
  });

  return prices.filter((price) => isPublicPriceVisible(price));
}

function buildProductSearchResult(product, prices) {
  const lowestPrice = prices.length > 0 ? prices[0].toPublicJSON() : null;

  return {
    ...product.toPublicJSON({ includeImages: true }),
    priceCount: prices.length,
    lowestPrice,
    prices: prices.map((price) => price.toPublicJSON()),
  };
}

async function searchProducts(req, res, next) {
  try {
    const { q, categoryId, brand, city, sort } = req.query;
    const where = { isAvailable: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brand) {
      where.brand = { [Op.iLike]: brand };
    }

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { brand: { [Op.iLike]: `%${q}%` } },
        { sku: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      include: productInclude,
      order: [['name', 'ASC']],
    });

    const results = [];

    for (const product of products) {
      const prices = await fetchVisiblePrices({ productId: product.id, city });
      results.push(buildProductSearchResult(product, prices));
    }

    if (sort === 'price_asc') {
      results.sort((a, b) => {
        const priceA = a.lowestPrice?.price ?? Number.MAX_VALUE;
        const priceB = b.lowestPrice?.price ?? Number.MAX_VALUE;
        return priceA - priceB;
      });
    } else if (sort === 'price_desc') {
      results.sort((a, b) => {
        const priceA = a.lowestPrice?.price ?? -1;
        const priceB = b.lowestPrice?.price ?? -1;
        return priceB - priceA;
      });
    }

    return sendSuccess(res, {
      message: 'Product search completed successfully',
      data: results,
    });
  } catch (error) {
    return next(error);
  }
}

async function searchStores(req, res, next) {
  try {
    const { q, city, state, latitude, longitude, radiusKm } = req.query;
    const where = { ...verifiedStoreWhere };

    if (city) {
      where.city = { [Op.iLike]: city };
    }

    if (state) {
      where.state = { [Op.iLike]: state };
    }

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { city: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    let stores = await Store.findAll({
      where,
      order: [['name', 'ASC']],
    });

    if (latitude !== undefined && longitude !== undefined && radiusKm !== undefined) {
      stores = filterStoresByRadius(
        stores,
        Number(latitude),
        Number(longitude),
        Number(radiusKm)
      );
    }

    const results = await Promise.all(
      stores.filter(isPublicStoreVisible).map(async (store) => {
        const prices = await fetchVisiblePrices({ storeId: store.id });
        const uniqueProducts = new Set(prices.map((price) => price.productId));

        return {
          ...store.toPublicJSON(),
          listedProductCount: uniqueProducts.size,
          priceCount: prices.length,
        };
      })
    );

    return sendSuccess(res, {
      message: 'Store search completed successfully',
      data: results,
    });
  } catch (error) {
    return next(error);
  }
}

async function compareProductPrices(req, res, next) {
  try {
    const product = await getAvailableProductOr404(req.params.productId);
    const { city } = req.query;
    const prices = await fetchVisiblePrices({ productId: product.id, city });
    const formattedPrices = prices.map((price) => price.toPublicJSON());
    const lowestPrice = formattedPrices[0] || null;

    return sendSuccess(res, {
      message: 'Price comparison retrieved successfully',
      data: {
        product: product.toPublicJSON({ includeImages: true }),
        priceCount: formattedPrices.length,
        lowestPrice,
        prices: formattedPrices,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getLowestProductPrice(req, res, next) {
  try {
    const product = await getAvailableProductOr404(req.params.productId);
    const { city } = req.query;
    const prices = await fetchVisiblePrices({ productId: product.id, city });
    const lowestPrice = prices[0] ? prices[0].toPublicJSON() : null;

    return sendSuccess(res, {
      message: lowestPrice ? 'Lowest price retrieved successfully' : 'No prices found for this product',
      data: {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
        },
        lowestPrice,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  searchProducts,
  searchStores,
  compareProductPrices,
  getLowestProductPrice,
};
