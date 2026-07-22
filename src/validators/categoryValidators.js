const { body, param, query } = require('express-validator');

const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('slug').optional({ values: 'falsy' }).trim().isSlug().withMessage('slug must be URL-friendly'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateCategoryValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('slug').optional({ values: 'falsy' }).trim().isSlug().withMessage('slug must be URL-friendly'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const categoryIdValidator = [param('id').isUUID().withMessage('id must be a valid UUID')];

const listCategoriesValidator = [
  query('active').optional().isIn(['true', 'false']).withMessage('active must be true or false'),
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
  listCategoriesValidator,
};
