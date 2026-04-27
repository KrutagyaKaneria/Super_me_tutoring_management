const Session = require('../models/session.model');
const Student = require('../models/student.model');
const Tutor = require('../models/tutor.model');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

exports.scheduleSession = async (coordinatorId, data) => {
  const { studentId, tutorId, subject, scheduledDate, startTime, endTime } = data;

  if (!studentId || !tutorId || !scheduledDate || !startTime || !endTime) {
    throw new AppError('Missing required session fields', 400);
  }

  // 1. Fetch Profiles
  const studentProfile = await Student.findOne({ user: studentId });
  const tutorProfile = await Tutor.findOne({ user: tutorId });

  if (!studentProfile) throw new AppError('Student profile not found', 404);
  if (!tutorProfile) throw new AppError('Tutor profile not found', 404);

  // 2. Validate Student-Tutor Assignment Relation
  console.log('Validating assignment:', studentProfile.assignedTutor, tutorProfile._id);
  if (!studentProfile.assignedTutor || studentProfile.assignedTutor.toString() !== tutorProfile._id.toString()) {
    throw new AppError('This tutor is not officially assigned to the requested student.', 400);
  }

  // 3. Validate Availability Slot
  const dayOfWeek = new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long' });
  console.log('Checking availability for:', dayOfWeek, startTime, endTime);
  const matchingSlot = tutorProfile.availabilitySlots.find(slot => 
    slot.day === dayOfWeek && 
    startTime >= slot.startTime && 
    endTime <= slot.endTime
  );

  if (!matchingSlot) {
    throw new AppError(`Tutor is not available at this time on ${dayOfWeek}. Registered slots: ${tutorProfile.availabilitySlots.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}`, 400);
  }

  // 4. Prevent Tutor Double Booking (Overlap Check)
  // We check for any session on the same date where time overlaps
  const existingSessions = await Session.find({
    tutorId,
    scheduledDate: new Date(scheduledDate),
    status: { $nin: ['cancelled', 'rejected'] }
  });

  const hasOverlap = existingSessions.some(s => {
    const scheduledStart = s.scheduledStartTime || s.startTime;
    const scheduledEnd = s.scheduledEndTime || s.endTime;
    if (typeof scheduledStart !== 'string' || typeof scheduledEnd !== 'string') return false;
    // Overlap logic: (StartA < EndB) and (EndA > StartB)
    return (startTime < scheduledEnd) && (endTime > scheduledStart);
  });

  if (hasOverlap) {
    throw new AppError(`Tutor already has an overlapping session on this date.`, 400);
  }

  // 5. Calculate Duration
  const start = new Date(`${scheduledDate}T${startTime}`);
  const end = new Date(`${scheduledDate}T${endTime}`);
  const durationInHours = (end - start) / (1000 * 60 * 60);

  if (durationInHours <= 0) throw new AppError('End time must be after start time', 400);

  // 6. Generate meeting link uniquely
  const uniqueString = crypto.randomBytes(4).toString('hex');
  const meetingLink = `https://meet.platform.com/${tutorId.toString().slice(-4)}-${studentId.toString().slice(-4)}-${uniqueString}`;

  // 7. Create Session Object
  const newSession = await Session.create({
    studentId,
    tutorId,
    coordinatorId,
    subject,
    scheduledDate: new Date(scheduledDate),
    scheduledStartTime: startTime,
    scheduledEndTime: endTime,
    // Actual duration is calculated on tutor end-session.
    durationInHours: 0,
    meetingLink,
    status: 'scheduled'
  });

  return newSession;
};

exports.getTutorSessions = async (tutorUserId) => {
  // Return sessions mapped securely to standard profiles
  return await Session.find({ tutorId: tutorUserId }).populate('studentId', 'name email').sort({ scheduledDate: 1 });
};

exports.getStudentSchedule = async (studentUserId) => {
  return await Session.find({ studentId: studentUserId }).populate('tutorId', 'name email').sort({ scheduledDate: 1 });
};

exports.startSession = async (tutorUserId, sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  // Prevent unauthorized management
  if (session.tutorId.toString() !== tutorUserId.toString()) {
    throw new AppError('You are not authorized to manage this session.', 403);
  }

  // Only scheduled sessions can be started
  if (session.status !== 'scheduled') {
    throw new AppError('Cannot start a non-scheduled session.', 400);
  }

  // Prevent multiple in-progress sessions for the same tutor
  const inProgress = await Session.findOne({
    tutorId: session.tutorId,
    status: { $in: ['in_progress', 'ongoing', 'pending'] },
  });
  if (inProgress) {
    throw new AppError('You already have an in-progress session. Please end it before starting a new one.', 400);
  }

  // Save actual start timestamp
  session.startTime = new Date();
  session.status = 'in_progress';
  await session.save();

  return session;
};

exports.endSession = async (tutorUserId, sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.tutorId.toString() !== tutorUserId.toString()) {
    throw new AppError('You are not authorized to manage this session.', 403);
  }

  // Prevent end before start / invalid status
  if (!['in_progress', 'ongoing', 'pending'].includes(session.status)) {
    throw new AppError('Cannot end a session that is not in progress.', 400);
  }
  if (!session.startTime) {
    throw new AppError('You must start the session before attempting to end it.', 400);
  }
  if (session.endTime) {
    throw new AppError('This session has already been ended.', 400);
  }

  session.endTime = new Date();

  const start = new Date(session.startTime);
  const end = new Date(session.endTime);

  // Calculate duration in hours
  const diffInMs = end.getTime() - start.getTime();
  const durationInHours = diffInMs / (1000 * 60 * 60);

  if (durationInHours <= 0) {
    throw new AppError('End time must be after start time', 400);
  }

  // Prevent excessive duration (>3 hours)
  if (durationInHours > 3) {
    throw new AppError('Session exceeded maximum permitted duration of 3 hours. Manual supervisor override required.', 400);
  }

  // Save actual duration
  session.durationInHours = Number(durationInHours.toFixed(2));
  session.status = 'pending_approval';
  await session.save();

  return session;
};

exports.submitManualSession = async (tutorUserId, data) => {
  const { studentId, date, startTime, endTime } = data;

  if (!studentId || !date || !startTime || !endTime) {
    throw new AppError('Missing required session fields', 400);
  }

  // Calculate duration
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  
  if (end <= start) {
    throw new AppError('End time must be after start time', 400);
  }

  const durationInHours = (end - start) / (1000 * 60 * 60);

  if (durationInHours > 3) {
    throw new AppError('Session exceeded maximum permitted duration of 3 hours.', 400);
  }

  // Find a coordinator to assign this manual log to (usually the system or first admin/coordinator)
  const User = require('../models/user.model');
  const coordinator = await User.findOne({ role: 'coordinator' });
  if (!coordinator) throw new AppError('No coordinator found in system to process manual log', 500);

  const newSession = await Session.create({
    studentId,
    tutorId: tutorUserId,
    coordinatorId: coordinator._id,
    subject: 'Manual Log',
    scheduledDate: new Date(date),
    scheduledStartTime: startTime,
    scheduledEndTime: endTime,
    startTime: start,
    endTime: end,
    durationInHours: Number(durationInHours.toFixed(2)),
    status: 'pending_approval'
  });

  return newSession;
};
