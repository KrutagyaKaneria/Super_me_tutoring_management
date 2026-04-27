const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/user.model');
const Tutor = require('./src/models/tutor.model');
const Student = require('./src/models/student.model');
const Session = require('./src/models/session.model');
const FeeConfig = require('./src/models/feeConfig.model');
const Exam = require('./src/models/exam.model');

dotenv.config({ override: true });

const users = [
  { name: 'Admin User', email: 'admin@superme.com', password: 'password123', role: 'admin' },
  { name: 'Alice Coordinator', email: 'coordinator@superme.com', password: 'password123', role: 'coordinator' },
  { name: 'John Tutor', email: 'tutor@superme.com', password: 'password123', role: 'tutor' },
  { name: 'Robert Tutor', email: 'robert@superme.com', password: 'password123', role: 'tutor' },
  { name: 'Sam Student', email: 'student@superme.com', password: 'password123', role: 'student' },
  { name: 'Emma Student', email: 'emma@superme.com', password: 'password123', role: 'student' },
  { name: 'Parent User', email: 'parent@superme.com', password: 'password123', role: 'parent' },
];

const feeConfigs = [
  { gradeMin: 1, gradeMax: 5, hourlyRate: 200 },
  { gradeMin: 6, gradeMax: 8, hourlyRate: 250 },
  { gradeMin: 9, gradeMax: 10, hourlyRate: 300 },
  { gradeMin: 11, gradeMax: 12, hourlyRate: 350 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tutoring_platform');
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Tutor.deleteMany(),
      Student.deleteMany(),
      Session.deleteMany(),
      FeeConfig.deleteMany(),
      Exam.deleteMany(),
    ]);
    console.log('Cleared existing data.');

    // Seed Users
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users.`);

    // Seed Fee Configs
    await FeeConfig.insertMany(feeConfigs);
    console.log('Seeded Fee Configs.');

    // Find specific users for linking
    const admin = createdUsers.find(u => u.role === 'admin');
    const coordinator = createdUsers.find(u => u.role === 'coordinator');
    const tutor1 = createdUsers.find(u => u.email === 'tutor@superme.com');
    const tutor2 = createdUsers.find(u => u.email === 'robert@superme.com');
    const student1 = createdUsers.find(u => u.email === 'student@superme.com');
    const student2 = createdUsers.find(u => u.email === 'emma@superme.com');
    const parent = createdUsers.find(u => u.role === 'parent');

    // Seed Tutor Profiles
    const tutorProfiles = await Tutor.create([
      {
        user: tutor1._id,
        subjects: ['Mathematics', 'Science'],
        languages: ['English', 'Hindi'],
        rating: 4.8,
        availabilitySlots: ['Mon 10am-12pm', 'Wed 2pm-4pm'],
        totalEarnings: 1200,
        pendingEarnings: 300
      },
      {
        user: tutor2._id,
        subjects: ['English', 'History'],
        languages: ['English'],
        rating: 4.5,
        availabilitySlots: ['Tue 4pm-6pm', 'Thu 10am-12pm'],
        totalEarnings: 800,
        pendingEarnings: 0
      }
    ]);
    console.log('Seeded Tutor profiles.');

    // Seed Student Profiles
    const studentProfiles = await Student.create([
      {
        user: student1._id,
        grade: '10',
        parent: parent._id,
        assignedTutor: tutorProfiles[0]._id,
        totalFeesPaid: 2000,
        pendingFees: 600
      },
      {
        user: student2._id,
        grade: '8',
        parent: parent._id,
        assignedTutor: tutorProfiles[1]._id,
        totalFeesPaid: 1500,
        pendingFees: 0
      }
    ]);
    console.log('Seeded Student profiles.');

    // Seed Sessions
    const now = new Date();
    await Session.create([
      {
        studentId: student1._id,
        tutorId: tutor1._id,
        coordinatorId: coordinator._id,
        subject: 'Mathematics',
        scheduledDate: new Date(now.getTime() - 86400000), // Yesterday
        startTime: '10:00',
        endTime: '11:00',
        durationInHours: 1,
        status: 'approved',
        meetingLink: 'zoom.us/j/123456'
      },
      {
        studentId: student2._id,
        tutorId: tutor2._id,
        coordinatorId: coordinator._id,
        subject: 'English',
        scheduledDate: now, // Today
        startTime: '14:00',
        endTime: '15:30',
        durationInHours: 1.5,
        status: 'scheduled',
        meetingLink: 'meet.google.com/abc-defg-hij'
      },
      {
        studentId: student1._id,
        tutorId: tutor1._id,
        coordinatorId: coordinator._id,
        subject: 'Science',
        scheduledDate: new Date(now.getTime() - 172800000), // 2 days ago
        startTime: '16:00',
        endTime: '18:00',
        durationInHours: 2,
        status: 'completed', // Awaiting approval
        meetingLink: 'zoom.us/j/789012'
      }
    ]);
    console.log('Seeded Sessions.');

    // Seed Exams/Marks
    await Exam.create([
      {
        studentId: student1._id,
        subject: 'Mathematics',
        examName: 'Midterm',
        marks: 85,
        totalMarks: 100,
        date: new Date(now.getTime() - 604800000), // 1 week ago
        addedBy: coordinator._id
      },
      {
        studentId: student1._id,
        subject: 'Science',
        examName: 'Unit Test',
        marks: 42,
        totalMarks: 50,
        date: new Date(now.getTime() - 259200000), // 3 days ago
        addedBy: coordinator._id
      },
      {
        studentId: student2._id,
        subject: 'English',
        examName: 'Midterm',
        marks: 78,
        totalMarks: 100,
        date: new Date(now.getTime() - 604800000),
        addedBy: coordinator._id
      }
    ]);
    console.log('Seeded Exams.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
