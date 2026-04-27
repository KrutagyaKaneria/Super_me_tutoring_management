const express = require('express');
const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
// Optional: Perhaps parents could use this route too, depending on requirements,
// but explicitly restricting to students + admin here for now.
router.use(roleMiddleware.restrictTo('student', 'admin', 'parent'));

router.get('/dashboard', studentController.getDashboard);
router.get('/schedule', studentController.getSchedule);
router.get('/marks', studentController.getMarks);

module.exports = router;
