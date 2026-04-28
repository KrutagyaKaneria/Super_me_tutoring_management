const express = require('express');
const adminPricingController = require('../controllers/admin.pricing.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('admin'));

router.put('/', adminPricingController.upsertAssignmentPricing);
router.get('/', adminPricingController.getAssignmentPricing);

module.exports = router;
