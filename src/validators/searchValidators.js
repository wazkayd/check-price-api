const { query, param } = require('express-validator');

const searchProductsValidator = [
  query('q').optional().trim(),
  query('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  query('brand').optional().trim(),
  query('city').optional().trim(),
  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'name'])
    .withMessage('sort must be price_asc, price_desc, or name'),
];

const searchStoresValidator = [
  query('q').optional().trim(),
  query('city').optional().trim(),
  query('state').optional().trim(),
  query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('latitude must be between -90 and 90'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude must be between -180 and 180'),
  query('radiusKm').optional().isFloat({ gt: 0 }).withMessage('radiusKm must be greater than 0'),
  query('latitude').custom((value, { req }) => {
    if (value !== undefined || req.query.longitude !== undefined || req.query.radiusKm !== undefined) {
      if (req.query.latitude === undefined || req.query.longitude === undefined || req.query.radiusKm === undefined) {
        throw new Error('latitude, longitude, and radiusKm must be provided together');
      }
    }

    return true;
  }),
];

const compareProductValidator = [
  param('productId').isUUID().withMessage('productId must be a valid UUID'),
  query('city').optional().trim(),
];

const lowestPriceValidator = [
  param('productId').isUUID().withMessage('productId must be a valid UUID'),
  query('city').optional().trim(),
];

module.exports = {
  searchProductsValidator,
  searchStoresValidator,
  compareProductValidator,
  lowestPriceValidator,
};
