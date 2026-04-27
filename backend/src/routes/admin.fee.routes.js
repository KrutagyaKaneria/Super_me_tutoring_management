const express = require('express');
const adminFeeController = require('../controllers/admin.fee.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
// Strict admin lock
router.use(roleMiddleware.restrictTo('admin'));

router.get('/', adminFeeController.getAllFeeConfigs);
router.patch('/', adminFeeController.upsertFeeConfig);

module.exports = router;
