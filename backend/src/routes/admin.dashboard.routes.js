const express = require('express');
const adminDashboardController = require('../controllers/admin.dashboard.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('admin'));

router.get('/', adminDashboardController.getAdminDashboard);

module.exports = router;
