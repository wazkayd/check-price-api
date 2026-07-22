const { Op } = require('sequelize');
const { ProductCategory, Product } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { slugify } = require('../utils/slugify');

async function getCategoryOr404(id) {
  const category = await ProductCategory.findByPk(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
}

async function buildUniqueSlug(name, excludeId = null) {
  let baseSlug = slugify(name);

  if (!baseSlug) {
    throw new AppError('Unable to generate a valid slug from category name', 400);
  }

  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const where = { slug: candidate };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existing = await ProductCategory.findOne({ where });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function listCategories(req, res, next) {
  try {
    const { active } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    const where = {};

    if (active === 'true') {
      where.isActive = true;
    } else if (active === 'false') {
      where.isActive = false;
    } else if (!isAdmin) {
      where.isActive = true;
    }

    const categories = await ProductCategory.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return sendSuccess(res, {
      message: 'Categories retrieved successfully',
      data: categories.map((category) => category.toPublicJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await getCategoryOr404(req.params.id);

    if (!category.isActive && req.user?.role !== 'ADMIN') {
      throw new AppError('Category not found', 404);
    }

    return sendSuccess(res, {
      message: 'Category retrieved successfully',
      data: category.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description, slug, isActive } = req.body;
    const uniqueSlug = slug ? slugify(slug) : await buildUniqueSlug(name);

    if (!uniqueSlug) {
      throw new AppError('slug is invalid', 400);
    }

    const category = await ProductCategory.create({
      name,
      description,
      slug: uniqueSlug,
      isActive: isActive !== undefined ? isActive : true,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Category created successfully',
      data: category.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await getCategoryOr404(req.params.id);
    const { name, description, slug, isActive } = req.body;

    if (name !== undefined) {
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (slug !== undefined) {
      category.slug = await buildUniqueSlug(slug, category.id);
    } else if (name !== undefined) {
      category.slug = await buildUniqueSlug(name, category.id);
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    return sendSuccess(res, {
      message: 'Category updated successfully',
      data: category.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await getCategoryOr404(req.params.id);

    const productCount = await Product.count({ where: { categoryId: category.id } });

    if (productCount > 0) {
      throw new AppError('Cannot delete a category that has products assigned to it', 409);
    }

    await category.destroy();

    return sendSuccess(res, {
      message: 'Category deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
