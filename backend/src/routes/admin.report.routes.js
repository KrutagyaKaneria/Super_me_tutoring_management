const express = require('express');
const adminReportController = require('../controllers/admin.report.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('admin'));

router.get('/', adminReportController.getPlatformReports);

module.exports = router;
