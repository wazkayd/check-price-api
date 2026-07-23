const express = require('express');
const priceController = require('../controllers/priceController');
const validateRequest = require('../middleware/validateRequest');
const { authenticateJwt, optionalAuthenticateJwt } = require('../middleware/auth');
const { requirePriceManagementAccess } = require('../middleware/authorize');
const {
  submitPriceValidator,
  updatePriceValidator,
  priceIdValidator,
  listPricesValidator,
} = require('../validators/priceValidators');

const router = express.Router();

/**
 * @swagger
 * /prices:
 *   get:
 *     summary: List product prices
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Prices retrieved successfully
 */
router.get('/', listPricesValidator, validateRequest, optionalAuthenticateJwt, priceController.listPrices);

/**
 * @swagger
 * /prices/{id}/history:
 *   get:
 *     summary: Get price change history
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Price history retrieved successfully
 */
router.get(
  '/:id/history',
  authenticateJwt,
  priceIdValidator,
  validateRequest,
  requirePriceManagementAccess,
  priceController.getPriceHistory
);

/**
 * @swagger
 * /prices/{id}:
 *   get:
 *     summary: Get a product price by ID
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Price retrieved successfully
 */
router.get('/:id', priceIdValidator, validateRequest, optionalAuthenticateJwt, priceController.getPrice);

/**
 * @swagger
 * /prices:
 *   post:
 *     summary: Submit a product price for a store
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, storeId, price]
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               storeId:
 *                 type: string
 *                 format: uuid
 *               price:
 *                 type: number
 *                 example: 1500.00
 *               currency:
 *                 type: string
 *                 example: NGN
 *     responses:
 *       201:
 *         description: Price submitted successfully
 */
router.post(
  '/',
  authenticateJwt,
  submitPriceValidator,
  validateRequest,
  requirePriceManagementAccess,
  priceController.submitPrice
);

/**
 * @swagger
 * /prices/{id}:
 *   put:
 *     summary: Update a product price
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [price]
 *             properties:
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Price updated successfully
 */
router.put(
  '/:id',
  authenticateJwt,
  updatePriceValidator,
  validateRequest,
  requirePriceManagementAccess,
  priceController.updatePrice
);

module.exports = router;
