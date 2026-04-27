const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const config = require('./src/config/env');

const users = [
  {
    name: 'System Admin',
    email: 'admin@superme.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Alice Coordinator',
    email: 'coordinator@superme.com',
    password: 'password123',
    role: 'coordinator'
  },
  {
    name: 'John Tutor',
    email: 'tutor@superme.com',
    password: 'password123',
    role: 'tutor'
  },
  {
    name: 'Sam Student',
    email: 'student@superme.com',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'Mary Parent',
    email: 'parent@superme.com',
    password: 'password123',
    role: 'parent'
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to:', config.mongoUri);
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB for seeding...');

    for (const user of users) {
      const exists = await User.findOne({ email: user.email });
      if (!exists) {
        await User.create(user);
        console.log(`Created ${user.role}: ${user.email}`);
      } else {
        console.log(`${user.role} already exists: ${user.email}`);
      }
    }

    console.log('Seeding completed!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
