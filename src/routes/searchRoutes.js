const express = require('express');
const searchController = require('../controllers/searchController');
const validateRequest = require('../middleware/validateRequest');
const {
  searchProductsValidator,
  searchStoresValidator,
  compareProductValidator,
  lowestPriceValidator,
} = require('../validators/searchValidators');

const router = express.Router();

/**
 * @swagger
 * /search/products:
 *   get:
 *     summary: Search products with price summary
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, name]
 *     responses:
 *       200:
 *         description: Product search completed successfully
 */
router.get('/products', searchProductsValidator, validateRequest, searchController.searchProducts);

/**
 * @swagger
 * /search/products/{productId}/lowest-price:
 *   get:
 *     summary: Get the lowest listed price for a product
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lowest price retrieved successfully
 */
router.get(
  '/products/:productId/lowest-price',
  lowestPriceValidator,
  validateRequest,
  searchController.getLowestProductPrice
);

/**
 * @swagger
 * /search/stores:
 *   get:
 *     summary: Search verified stores
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Store search completed successfully
 */
router.get('/stores', searchStoresValidator, validateRequest, searchController.searchStores);

/**
 * @swagger
 * /search/compare/{productId}:
 *   get:
 *     summary: Compare product prices across stores
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price comparison retrieved successfully
 */
router.get(
  '/compare/:productId',
  compareProductValidator,
  validateRequest,
  searchController.compareProductPrices
);

module.exports = router;
