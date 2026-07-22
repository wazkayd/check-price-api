const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('categoryId').isUUID().withMessage('categoryId must be a valid UUID'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('sku').optional({ values: 'falsy' }).trim(),
  body('brand').optional({ values: 'falsy' }).trim(),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
];

const updateProductValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('sku').optional({ values: 'falsy' }).trim(),
  body('brand').optional({ values: 'falsy' }).trim(),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
];

const productIdValidator = [param('id').isUUID().withMessage('id must be a valid UUID')];

const listProductsValidator = [
  query('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  query('available').optional().isIn(['true', 'false']).withMessage('available must be true or false'),
  query('all').optional().isIn(['true', 'false']).withMessage('all must be true or false'),
  query('q').optional().trim(),
];

const availabilityValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('isAvailable').isBoolean().withMessage('isAvailable is required and must be a boolean'),
];

const addImageValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('url').trim().isURL().withMessage('url must be a valid URL'),
  body('altText').optional({ values: 'falsy' }).trim(),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
];

const updateImageValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  param('imageId').isUUID().withMessage('imageId must be a valid UUID'),
  body('url').optional().trim().isURL().withMessage('url must be a valid URL'),
  body('altText').optional({ values: 'falsy' }).trim(),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
];

const imageIdValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  param('imageId').isUUID().withMessage('imageId must be a valid UUID'),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  listProductsValidator,
  availabilityValidator,
  addImageValidator,
  updateImageValidator,
  imageIdValidator,
};
