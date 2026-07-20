const express = require('express');
const storeController = require('../controllers/storeController');
const validateRequest = require('../middleware/validateRequest');
const { authenticateJwt, optionalAuthenticateJwt } = require('../middleware/auth');
const { authorize, requireStoreAgentAccess, requireStoreManagementAccess } = require('../middleware/authorize');
const {
  createStoreValidator,
  updateStoreValidator,
  storeIdValidator,
  assignAgentValidator,
  removeAgentValidator,
  listStoresValidator,
} = require('../validators/storeValidators');

const router = express.Router();

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: List stores
 *     description: Public users see verified stores only. Admins can pass all=true to list every store.
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, REJECTED, INACTIVE]
 *       - in: query
 *         name: verified
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
 *         description: Stores retrieved successfully
 */
router.get('/', listStoresValidator, validateRequest, optionalAuthenticateJwt, storeController.listStores);

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get a store by ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Store retrieved successfully
 *       404:
 *         description: Store not found
 */
router.get('/:id', storeIdValidator, validateRequest, optionalAuthenticateJwt, storeController.getStore);

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Create a store
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               city:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Store created successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticateJwt,
  authorize('ADMIN'),
  createStoreValidator,
  validateRequest,
  storeController.createStore
);

/**
 * @swagger
 * /stores/{id}:
 *   put:
 *     summary: Update a store
 *     tags: [Stores]
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
 *         description: Store updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Store not found
 */
router.put(
  '/:id',
  authenticateJwt,
  storeIdValidator,
  updateStoreValidator,
  validateRequest,
  requireStoreManagementAccess,
  storeController.updateStore
);

/**
 * @swagger
 * /stores/{id}:
 *   delete:
 *     summary: Delete a store
 *     tags: [Stores]
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
 *         description: Store deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:id',
  authenticateJwt,
  authorize('ADMIN'),
  storeIdValidator,
  validateRequest,
  storeController.deleteStore
);

/**
 * @swagger
 * /stores/{id}/verify:
 *   patch:
 *     summary: Verify a store
 *     tags: [Stores]
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
 *         description: Store verified successfully
 */
router.patch(
  '/:id/verify',
  authenticateJwt,
  authorize('ADMIN'),
  storeIdValidator,
  validateRequest,
  storeController.verifyStore
);

/**
 * @swagger
 * /stores/{id}/reject:
 *   patch:
 *     summary: Reject a store
 *     tags: [Stores]
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
 *         description: Store rejected successfully
 */
router.patch(
  '/:id/reject',
  authenticateJwt,
  authorize('ADMIN'),
  storeIdValidator,
  validateRequest,
  storeController.rejectStore
);

/**
 * @swagger
 * /stores/{id}/agents:
 *   get:
 *     summary: List agents assigned to a store
 *     tags: [Stores]
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
 *         description: Store agents retrieved successfully
 */
router.get(
  '/:id/agents',
  authenticateJwt,
  storeIdValidator,
  validateRequest,
  requireStoreManagementAccess,
  storeController.listStoreAgents
);

/**
 * @swagger
 * /stores/{id}/agents:
 *   post:
 *     summary: Assign a user as a store agent
 *     tags: [Stores]
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
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Store agent assigned successfully
 */
router.post(
  '/:id/agents',
  authenticateJwt,
  authorize('ADMIN'),
  assignAgentValidator,
  validateRequest,
  storeController.assignStoreAgent
);

/**
 * @swagger
 * /stores/{id}/agents/{userId}:
 *   delete:
 *     summary: Remove a store agent assignment
 *     tags: [Stores]
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Store agent removed successfully
 */
router.delete(
  '/:id/agents/:userId',
  authenticateJwt,
  authorize('ADMIN'),
  removeAgentValidator,
  validateRequest,
  storeController.removeStoreAgent
);

module.exports = router;
