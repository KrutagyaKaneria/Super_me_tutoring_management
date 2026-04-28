const express = require('express');
const tutorController = require('../controllers/tutor.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
// Restrict to simply tutors. Admin could be added to array if desired, but requirements state "Tutor can update own profile"
router.use(roleMiddleware.restrictTo('tutor'));

router.get('/dashboard', tutorController.getDashboard);
router.get('/earnings', tutorController.getEarnings);
router.patch('/profile', tutorController.updateProfile);
router.get('/students', tutorController.getAllStudents);
router.get('/sessions', tutorController.getTutorSessions);
router.get('/marks', tutorController.getMarks);
router.patch('/start-session/:id', tutorController.startSession);
router.patch('/end-session/:id', tutorController.endSession);
router.post('/submit-attendance', tutorController.submitAttendance);
router.post('/add-marks', tutorController.addMarks);

module.exports = router;
