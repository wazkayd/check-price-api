const express = require('express');
const categoryController = require('../controllers/categoryController');
const validateRequest = require('../middleware/validateRequest');
const { authenticateJwt, optionalAuthenticateJwt } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
  listCategoriesValidator,
} = require('../validators/categoryValidators');

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List product categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', listCategoriesValidator, validateRequest, optionalAuthenticateJwt, categoryController.listCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 */
router.get('/:id', categoryIdValidator, validateRequest, optionalAuthenticateJwt, categoryController.getCategory);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a product category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
  '/',
  authenticateJwt,
  authorize('ADMIN'),
  createCategoryValidator,
  validateRequest,
  categoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a product category
 *     tags: [Categories]
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
 *         description: Category updated successfully
 */
router.put(
  '/:id',
  authenticateJwt,
  authorize('ADMIN'),
  updateCategoryValidator,
  validateRequest,
  categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a product category
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 */
router.delete(
  '/:id',
  authenticateJwt,
  authorize('ADMIN'),
  categoryIdValidator,
  validateRequest,
  categoryController.deleteCategory
);

module.exports = router;
