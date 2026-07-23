const { body, param, query } = require('express-validator');

const submitPriceValidator = [
  body('productId').isUUID().withMessage('productId must be a valid UUID'),
  body('storeId').isUUID().withMessage('storeId must be a valid UUID'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('currency must be a 3-letter code'),
];

const updatePriceValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('currency must be a 3-letter code'),
];

const priceIdValidator = [param('id').isUUID().withMessage('id must be a valid UUID')];

const listPricesValidator = [
  query('productId').optional().isUUID().withMessage('productId must be a valid UUID'),
  query('storeId').optional().isUUID().withMessage('storeId must be a valid UUID'),
  query('all').optional().isIn(['true', 'false']).withMessage('all must be true or false'),
];

module.exports = {
  submitPriceValidator,
  updatePriceValidator,
  priceIdValidator,
  listPricesValidator,
};
