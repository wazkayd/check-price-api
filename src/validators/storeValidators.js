const { body, param, query } = require('express-validator');

const createStoreValidator = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('address').trim().notEmpty().withMessage('address is required'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('city').optional({ values: 'falsy' }).trim(),
  body('state').optional({ values: 'falsy' }).trim(),
  body('country').optional({ values: 'falsy' }).trim(),
  body('postalCode').optional({ values: 'falsy' }).trim(),
  body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('latitude must be between -90 and 90'),
  body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('longitude must be between -180 and 180'),
  body('phoneNumber').optional({ values: 'falsy' }).trim(),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('email must be valid').normalizeEmail(),
];

const updateStoreValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('address cannot be empty'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('city').optional({ values: 'falsy' }).trim(),
  body('state').optional({ values: 'falsy' }).trim(),
  body('country').optional({ values: 'falsy' }).trim(),
  body('postalCode').optional({ values: 'falsy' }).trim(),
  body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('latitude must be between -90 and 90'),
  body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('longitude must be between -180 and 180'),
  body('phoneNumber').optional({ values: 'falsy' }).trim(),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('email must be valid').normalizeEmail(),
  body('status')
    .optional()
    .isIn(['PENDING', 'VERIFIED', 'REJECTED', 'INACTIVE'])
    .withMessage('status must be PENDING, VERIFIED, REJECTED, or INACTIVE'),
];

const storeIdValidator = [param('id').isUUID().withMessage('id must be a valid UUID')];

const assignAgentValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('userId').isUUID().withMessage('userId must be a valid UUID'),
];

const removeAgentValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  param('userId').isUUID().withMessage('userId must be a valid UUID'),
];

const listStoresValidator = [
  query('city').optional().trim(),
  query('status')
    .optional()
    .isIn(['PENDING', 'VERIFIED', 'REJECTED', 'INACTIVE'])
    .withMessage('status must be PENDING, VERIFIED, REJECTED, or INACTIVE'),
  query('verified').optional().isIn(['true', 'false']).withMessage('verified must be true or false'),
  query('all').optional().isIn(['true', 'false']).withMessage('all must be true or false'),
];

module.exports = {
  createStoreValidator,
  updateStoreValidator,
  storeIdValidator,
  assignAgentValidator,
  removeAgentValidator,
  listStoresValidator,
};
