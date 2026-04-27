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
    // Overlap logic: (StartA < EndB) and (EndA > StartB)
    return (startTime < s.endTime) && (endTime > s.startTime);
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
    startTime,
    endTime,
    durationInHours: Number(durationInHours.toFixed(2)),
    meetingLink,
    status: 'scheduled'
  });

  return newSession;
};

exports.getTutorSessions = async (tutorUserId) => {
  // Return sessions mapped securely to standard profiles
  return await Session.find({ tutorId: tutorUserId }).populate('studentId', 'name email').sort({ scheduledDate: 1 });
};

exports.startSession = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== 'scheduled') throw new AppError('Only scheduled sessions can be started', 400);

  // Safety: Prevent multiple ongoing sessions for the same tutor
  const ongoing = await Session.findOne({ tutorId: session.tutorId, status: 'ongoing' });
  if (ongoing) {
    throw new AppError('You already have an ongoing session. Please end it before starting a new one.', 400);
  }

  session.status = 'ongoing';
  session.actualStartTime = new Date();
  await session.save();

  return session;
};

exports.endSession = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== 'ongoing') throw new AppError('Session must be ongoing to end it', 400);

  session.status = 'completed';
  session.actualEndTime = new Date();
  
  // Calculate duration in hours
  const start = new Date(session.actualStartTime);
  const end = new Date(session.actualEndTime);
  const durationInHours = (end - start) / (1000 * 60 * 60);
  
  // Limit to 5 hours max as per safety rule
  session.durationInHours = Math.min(Number(durationInHours.toFixed(2)), 5);
  
  await session.save();

  return session;
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

  // Prevent multiple starts or starting completed schedules
  if (session.status === 'pending') {
    throw new AppError('This session has already been started.', 400);
  }
  if (session.status === 'completed' || session.status === 'cancelled') {
    throw new AppError(`Cannot start a ${session.status} session.`, 400);
  }

  session.actualStartTime = new Date();
  session.status = 'pending';
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

  // Prevent end before start
  if (session.status !== 'pending' || !session.actualStartTime) {
    throw new AppError('You must start the session before attempting to end it.', 400);
  }

  session.actualEndTime = new Date();
  
  // Calculate duration in hours
  const diffInMs = session.actualEndTime - session.actualStartTime;
  const durationInHours = diffInMs / (1000 * 60 * 60);

  // Prevent excessive duration (>3 hours)
  if (durationInHours > 3) {
    throw new AppError('Session exceeded maximum permitted duration of 3 hours. Manual supervisor override required.', 400);
  }

  // Override the scheduled duration with actual duration
  session.durationInHours = Number(durationInHours.toFixed(2));
  session.status = 'completed';
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

  if (durationInHours > 5) {
    throw new AppError('Session exceeded maximum permitted duration of 5 hours.', 400);
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
    startTime,
    endTime,
    actualStartTime: start,
    actualEndTime: end,
    durationInHours: Number(durationInHours.toFixed(2)),
    status: 'completed'
  });

  return newSession;
};
