const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

dotenv.config();

const users = [
  { name: 'Admin', email: 'admin@cms.com', password: 'admin123', role: 'admin' },
  { name: 'Arjun Sharma', email: 'arjun12@gmail.com', password: 'arjun123', role: 'user', phone: '9876543210', address: 'Block A, Sector 12, Hyderabad' },
  { name: 'Priya Nair', email: 'priya12@gmail.com', password: 'priya123', role: 'user', phone: '9123456789', address: 'Flat 4B, Green Valley, Pune' },
  { name: 'Rahul Mehta', email: 'rahul12@gmail.com', password: 'rahul123', role: 'user', phone: '9988776655', address: '22, Lake View Road, Bangalore' },
  { name: 'Varshini', email: 'varshi123@gmail.com', password: 'varshi123', role: 'user', phone: '9734689234', address: 'Flat 101, Jaya towers, Srikakulam' },
  { name: 'Jyothsna', email: 'joshu123@gmail.com', password: 'joshu123', role: 'user', phone: '6580427943', address: '42, Prashanti nagar colony, Hyderabad' },
  { name: 'Krishna Priya', email: 'kp123@gmail.com', password: 'kp1234', role: 'user', phone: '9087524728', address: 'Black F, Sector 3, Mumbai' }
];

const complaintTemplates = [
  { title: 'Pothole on Main Road', category: 'Infrastructure', description: 'There is a large pothole near the main intersection causing accidents daily. Several two-wheelers have been damaged.', priority: 'High', status: 'Resolved', adminNote: 'Repaired by municipal team on 15th Nov.' },
  { title: 'Water Bill Discrepancy', category: 'Billing', description: 'My water bill for October is 3x higher than usual with no explanation or prior notice from the department.', priority: 'Medium', status: 'In Progress', adminNote: 'Investigating with billing department. Will update within 3 working days.' },
  { title: 'Street Light Not Working', category: 'Infrastructure', description: 'Three street lights on Park Avenue have been non-functional for 2 weeks. The area is very dark and unsafe at night.', priority: 'Medium', status: 'Pending', adminNote: '' },
  { title: 'Garbage Not Collected', category: 'Sanitation', description: 'Garbage has not been collected from our street for the past 5 days. It is causing a foul smell and health hazard.', priority: 'High', status: 'In Progress', adminNote: 'Sanitation crew dispatched. Collection scheduled for tomorrow.' },
  { title: 'Noise Pollution from Construction', category: 'Noise', description: 'Unauthorized construction work is happening past midnight, disturbing sleep for the entire residential colony.', priority: 'High', status: 'Pending', adminNote: '' },
  { title: 'Broken Park Bench', category: 'Infrastructure', description: 'The bench near the children\'s play area is broken and poses a safety risk to kids. Sharp edges are exposed.', priority: 'Low', status: 'Resolved', adminNote: 'Bench replaced with a new one.' },
  { title: 'Sewage Overflow', category: 'Sanitation', description: 'Sewage is overflowing onto the footpath near Block C. It is a serious hygiene and health concern for residents.', priority: 'High', status: 'Pending', adminNote: '' },
  { title: 'Damaged Road Divider', category: 'Infrastructure', description: 'The road divider near the hospital entrance is damaged and causing traffic congestion. Urgent repair needed.', priority: 'Medium', status: 'In Progress', adminNote: 'Work order issued to PWD.' },
  { title: 'Electricity Outage – No Notice', category: 'Service', description: 'We face unannounced electricity cuts of 4–6 hours daily for the past week. No prior notice given by the board.', priority: 'High', status: 'Pending', adminNote: '' },
  { title: 'Stray Dog Menace', category: 'Safety', description: 'A pack of stray dogs near the school gate has been attacking children. Urgent action required from the corporation.', priority: 'High', status: 'Resolved', adminNote: 'Dogs have been relocated to the shelter. Sterilization program underway.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    const userMap = {};
    createdUsers.forEach(u => { userMap[u.email] = u._id; });

    // Assign complaints to users round-robin
    const userEmails = ['arjun12@gmail.com', 'joshu123@gmail.com', 'varshi123@gmail.com'];
    const complaints = complaintTemplates.map((c, i) => ({
      ...c,
      user: userMap[userEmails[i % 3]],
      complaintId: `CMP${String(i + 1).padStart(4, '0')}`,
      statusHistory: [
        { status: 'Pending', note: 'Complaint submitted', changedAt: new Date(Date.now() - (10 - i) * 86400000) },
        ...(c.status !== 'Pending' ? [{ status: c.status, note: c.adminNote || 'Status updated', changedAt: new Date() }] : []),
      ],
      createdAt: new Date(Date.now() - (10 - i) * 86400000),
    }));

    await Complaint.insertMany(complaints);
    console.log(`📋 Created ${complaints.length} complaints`);

    console.log('\n🎉 Seed complete!');
    console.log('──────────────────────────────');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();
