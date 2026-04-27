const express = require('express');
const adminUserController = require('../controllers/admin.user.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes below this middleware and restrict them to 'admin'
router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('admin'));

router
  .route('/')
  .post(adminUserController.createUser)
  .get(adminUserController.getAllUsers);

router
  .route('/:id')
  .patch(adminUserController.updateUser)
  .delete(adminUserController.deleteUser);

module.exports = router;
