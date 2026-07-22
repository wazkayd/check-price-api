const { Op } = require('sequelize');
const { Product, ProductCategory, ProductImage } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const PRODUCT_FIELDS = ['name', 'description', 'sku', 'brand', 'categoryId', 'isAvailable'];

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

async function getProductOr404(id, { includeRelations = false } = {}) {
  const product = await Product.findByPk(id, includeRelations ? { include: productInclude } : undefined);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

async function getCategoryOr404(id) {
  const category = await ProductCategory.findByPk(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (!category.isActive) {
    throw new AppError('Category is not active', 400);
  }

  return category;
}

async function unsetPrimaryImages(productId, transaction) {
  await ProductImage.update(
    { isPrimary: false },
    {
      where: { productId },
      transaction,
    }
  );
}

async function listProducts(req, res, next) {
  try {
    const { categoryId, available, q, all } = req.query;
    const isCatalogManager = ['ADMIN', 'STORE_AGENT'].includes(req.user?.role);
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (available === 'true') {
      where.isAvailable = true;
    } else if (available === 'false') {
      where.isAvailable = false;
    } else if (all !== 'true' || !isCatalogManager) {
      where.isAvailable = true;
    }

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { brand: { [Op.iLike]: `%${q}%` } },
        { sku: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      include: productInclude,
      order: [['name', 'ASC']],
    });

    return sendSuccess(res, {
      message: 'Products retrieved successfully',
      data: products.map((product) => product.toPublicJSON({ includeImages: true })),
    });
  } catch (error) {
    return next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await getProductOr404(req.params.id, { includeRelations: true });
    const isCatalogManager = ['ADMIN', 'STORE_AGENT'].includes(req.user?.role);

    if (!product.isAvailable && !isCatalogManager) {
      throw new AppError('Product not found', 404);
    }

    return sendSuccess(res, {
      message: 'Product retrieved successfully',
      data: product.toPublicJSON({ includeImages: true }),
    });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    await getCategoryOr404(req.body.categoryId);

    const payload = {};

    PRODUCT_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    const product = await Product.create(payload);
    await product.reload({ include: productInclude });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Product created successfully',
      data: product.toPublicJSON({ includeImages: true }),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await getProductOr404(req.params.id);

    if (req.body.categoryId !== undefined) {
      await getCategoryOr404(req.body.categoryId);
    }

    PRODUCT_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    await product.reload({ include: productInclude });

    return sendSuccess(res, {
      message: 'Product updated successfully',
      data: product.toPublicJSON({ includeImages: true }),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await getProductOr404(req.params.id);
    await product.destroy();

    return sendSuccess(res, {
      message: 'Product deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const product = await getProductOr404(req.params.id);
    product.isAvailable = req.body.isAvailable;
    await product.save();
    await product.reload({ include: productInclude });

    return sendSuccess(res, {
      message: 'Product availability updated successfully',
      data: product.toPublicJSON({ includeImages: true }),
    });
  } catch (error) {
    return next(error);
  }
}

async function listProductImages(req, res, next) {
  try {
    await getProductOr404(req.params.id);

    const images = await ProductImage.findAll({
      where: { productId: req.params.id },
      order: [
        ['isPrimary', 'DESC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    return sendSuccess(res, {
      message: 'Product images retrieved successfully',
      data: images.map((image) => image.toPublicJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

async function addProductImage(req, res, next) {
  try {
    await getProductOr404(req.params.id);

    const image = await Product.sequelize.transaction(async (transaction) => {
      if (req.body.isPrimary) {
        await unsetPrimaryImages(req.params.id, transaction);
      }

      return ProductImage.create(
        {
          productId: req.params.id,
          url: req.body.url,
          altText: req.body.altText,
          isPrimary: req.body.isPrimary || false,
          sortOrder: req.body.sortOrder ?? 0,
        },
        { transaction }
      );
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Product image added successfully',
      data: image.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProductImage(req, res, next) {
  try {
    const image = await ProductImage.findOne({
      where: {
        id: req.params.imageId,
        productId: req.params.id,
      },
    });

    if (!image) {
      throw new AppError('Product image not found', 404);
    }

    await Product.sequelize.transaction(async (transaction) => {
      if (req.body.isPrimary === true) {
        await unsetPrimaryImages(req.params.id, transaction);
      }

      if (req.body.url !== undefined) {
        image.url = req.body.url;
      }

      if (req.body.altText !== undefined) {
        image.altText = req.body.altText;
      }

      if (req.body.isPrimary !== undefined) {
        image.isPrimary = req.body.isPrimary;
      }

      if (req.body.sortOrder !== undefined) {
        image.sortOrder = req.body.sortOrder;
      }

      await image.save({ transaction });
    });

    return sendSuccess(res, {
      message: 'Product image updated successfully',
      data: image.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProductImage(req, res, next) {
  try {
    const image = await ProductImage.findOne({
      where: {
        id: req.params.imageId,
        productId: req.params.id,
      },
    });

    if (!image) {
      throw new AppError('Product image not found', 404);
    }

    await image.destroy();

    return sendSuccess(res, {
      message: 'Product image deleted successfully',
      data: {
        id: req.params.imageId,
        productId: req.params.id,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateAvailability,
  listProductImages,
  addProductImage,
  updateProductImage,
  deleteProductImage,
};
