const express = require('express');
const coordinatorService = require('../services/coordinator.service');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('coordinator', 'admin'));

router.put(
  '/',
  catchAsync(async (req, res) => {
    const pricing = await coordinatorService.upsertAssignmentPricing(req.body);
    res.status(200).json(new ApiResponse(200, { pricing }, 'Assignment pricing updated successfully'));
  })
);

router.get(
  '/',
  catchAsync(async (req, res) => {
    const { tutorId, studentId, subject } = req.query;
    const pricing = await coordinatorService.getAssignmentPricing(tutorId, studentId, subject);
    res.status(200).json(new ApiResponse(200, { pricing }, 'Assignment pricing retrieved successfully'));
  })
);

module.exports = router;
