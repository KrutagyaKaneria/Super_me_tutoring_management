const express = require('express');
const coordinatorController = require('../controllers/coordinator.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('coordinator', 'admin'));

router.get('/dashboard', coordinatorController.getDashboard);
router.get('/tutors', coordinatorController.getAllTutors);
router.post('/assign-student', coordinatorController.assignStudent);
router.post('/schedule-session', coordinatorController.scheduleSession);

router.get('/pending-attendance', coordinatorController.getPendingAttendance);
router.patch('/approve-session/:id', coordinatorController.approveSession);
router.patch('/reject-session/:id', coordinatorController.rejectSession);
router.post('/add-marks', coordinatorController.addMarks);
router.get('/marks', coordinatorController.getAllMarks);
router.get('/sessions', coordinatorController.getAllSessions);
router.get('/students', coordinatorController.getAllStudents);

module.exports = router;
