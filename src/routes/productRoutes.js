const express = require('express');
const productController = require('../controllers/productController');
const validateRequest = require('../middleware/validateRequest');
const { authenticateJwt, optionalAuthenticateJwt } = require('../middleware/auth');
const { authorize, authorizeCatalogManager } = require('../middleware/authorize');
const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  listProductsValidator,
  availabilityValidator,
  addImageValidator,
  updateImageValidator,
  imageIdValidator,
} = require('../validators/productValidators');

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', listProductsValidator, validateRequest, optionalAuthenticateJwt, productController.listProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 */
router.get('/:id', productIdValidator, validateRequest, optionalAuthenticateJwt, productController.getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
  '/',
  authenticateJwt,
  authorizeCatalogManager,
  createProductValidator,
  validateRequest,
  productController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
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
 *         description: Product updated successfully
 */
router.put(
  '/:id',
  authenticateJwt,
  authorizeCatalogManager,
  updateProductValidator,
  validateRequest,
  productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 */
router.delete(
  '/:id',
  authenticateJwt,
  authorize('ADMIN'),
  productIdValidator,
  validateRequest,
  productController.deleteProduct
);

/**
 * @swagger
 * /products/{id}/availability:
 *   patch:
 *     summary: Update product availability
 *     tags: [Products]
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
 *             required: [isAvailable]
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product availability updated successfully
 */
router.patch(
  '/:id/availability',
  authenticateJwt,
  authorizeCatalogManager,
  availabilityValidator,
  validateRequest,
  productController.updateAvailability
);

/**
 * @swagger
 * /products/{id}/images:
 *   get:
 *     summary: List product images
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product images retrieved successfully
 */
router.get('/:id/images', productIdValidator, validateRequest, productController.listProductImages);

/**
 * @swagger
 * /products/{id}/images:
 *   post:
 *     summary: Add a product image
 *     tags: [Products]
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
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               altText:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product image added successfully
 */
router.post(
  '/:id/images',
  authenticateJwt,
  authorizeCatalogManager,
  addImageValidator,
  validateRequest,
  productController.addProductImage
);

/**
 * @swagger
 * /products/{id}/images/{imageId}:
 *   patch:
 *     summary: Update a product image
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product image updated successfully
 */
router.patch(
  '/:id/images/:imageId',
  authenticateJwt,
  authorizeCatalogManager,
  updateImageValidator,
  validateRequest,
  productController.updateProductImage
);

/**
 * @swagger
 * /products/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete a product image
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product image deleted successfully
 */
router.delete(
  '/:id/images/:imageId',
  authenticateJwt,
  authorizeCatalogManager,
  imageIdValidator,
  validateRequest,
  productController.deleteProductImage
);

module.exports = router;
