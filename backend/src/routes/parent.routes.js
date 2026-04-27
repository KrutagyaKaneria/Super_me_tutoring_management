const express = require('express');
const parentController = require('../controllers/parent.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('parent', 'admin'));

router.get('/dashboard', parentController.getDashboard);
router.get('/marks', parentController.getMarks);
router.get('/child-progress', parentController.getChildProgress);
router.get('/fee-ledger', parentController.getFeeLedger);
router.get('/payments', parentController.getPayments);
router.get('/download-report', parentController.downloadReport);

module.exports = router;
