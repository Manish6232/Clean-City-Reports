const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Report = require('./models/Report');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // ✅ SAFE: Only create demo users if they don't already exist
  const adminPw = await bcrypt.hash('MAnish345', 12);
  const userPw = await bcrypt.hash('User123', 12);

  const demoUsers = [
    { name: 'Admin User', email: 'manishsingh626332@gmail.com', password: 'MAnish345', role: 'admin', points: 500, reportsSubmitted: 10, reportsResolved: 8 },
    { name: 'Ravi Kumar', email: 'citizen123@gmail.com', password: userPw, role: 'Citizen123', points: 120, reportsSubmitted: 6, reportsResolved: 2 },
    { name: 'Priya Sharma', email: 'officer123@gmail.com', password: 'Officer123', role: 'municipal_officer', points: 300, reportsSubmitted: 2, reportsResolved: 15 }
  ];

  const createdUsers = {};
  for (const userData of demoUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⏭️  Skipping existing user: ${userData.email}`);
      createdUsers[userData.email] = existing;
    } else {
      createdUsers[userData.email] = await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    }
  }

  const admin = createdUsers['manishsingh626332@gmail.com'];
  const citizen = createdUsers['citizen123@gmail.com'];

  // ✅ SAFE: Only insert sample reports if database has none
  const reportCount = await Report.countDocuments();
  if (reportCount > 0) {
    console.log(`⏭️  Skipping reports — ${reportCount} already exist in database`);
    console.log('\n--- Demo login credentials ---');
  console.log('  Admin: manishsingh626332@gmail.com / MAnish345');
  console.log('  Officer: officer123@gmail.com / Officer123');
  console.log('  Citizen: citizen123@gmail.com / Citizen123');
    console.log('------------------------------\n');
    await mongoose.disconnect();
    return;
  }

  console.log('📋 No reports found — inserting sample reports...');

  // Sample reports around Bengaluru
  const reports = [
    { title: 'Overflowing garbage bin near Koramangala', description: 'The bin on 5th block main road has been overflowing for 3 days. Foul smell and flies.', category: 'overflowing_bin', severity: 'high', lat: 12.9352, lng: 77.6245, city: 'Bengaluru', address: '5th Block, Koramangala', status: 'in_progress' },
    { title: 'Illegal garbage dump on MG Road', description: 'Construction waste dumped illegally near the flyover. Blocking footpath.', category: 'garbage_dump', severity: 'critical', lat: 12.9752, lng: 77.6065, city: 'Bengaluru', address: 'MG Road, near Trinity Metro', status: 'pending' },
    { title: 'Plastic waste in Cubbon Park', description: 'Plastic bottles and wrappers scattered near the park entrance.', category: 'littering', severity: 'medium', lat: 12.9763, lng: 77.5929, city: 'Bengaluru', address: 'Cubbon Park Main Gate', status: 'resolved' },
    { title: 'Drain blockage causing flooding', description: 'Clogged storm drain causing water to flood the road after every rain.', category: 'drain_blockage', severity: 'critical', lat: 12.9165, lng: 77.6101, city: 'Bengaluru', address: 'HSR Layout Sector 1', status: 'under_review' },
    { title: 'Chemical waste dumped near lake', description: 'Suspicious drums with liquid dumped near Bellandur lake. Possible hazardous material.', category: 'hazardous_waste', severity: 'critical', lat: 12.9200, lng: 77.6700, city: 'Bengaluru', address: 'Bellandur Lake Road', status: 'in_progress' },
    { title: 'Unclean footpath on Brigade Road', description: 'Food vendors leaving garbage on footpath after closing hours.', category: 'street_cleaning', severity: 'low', lat: 12.9719, lng: 77.6069, city: 'Bengaluru', address: 'Brigade Road', status: 'resolved' },
  ];

  for (const r of reports) {
    await Report.create({
      title: r.title,
      description: r.description,
      category: r.category,
      severity: r.severity,
      status: r.status,
      location: { type: 'Point', coordinates: [r.lng, r.lat], city: r.city, address: r.address },
      reporter: citizen._id,
      aiAnalysis: {
        detectedIssues: ['Waste accumulation', 'Health hazard risk', 'Environmental contamination'],
        recommendedActions: ['Dispatch municipal truck within 24hrs', 'Issue fine to responsible party', 'Install CCTV for monitoring'],
        priorityScore: r.severity === 'critical' ? 9 : r.severity === 'high' ? 7 : r.severity === 'medium' ? 5 : 3,
        estimatedResolutionTime: r.severity === 'critical' ? '24 hours' : '2-3 days',
        environmentalImpact: 'Moderate impact on local ecosystem and public health'
      },
      statusHistory: [
        { status: 'pending', updatedBy: citizen._id, note: 'Report submitted by citizen' },
        ...(r.status !== 'pending' ? [{ status: r.status, updatedBy: admin._id, note: 'Reviewed by admin' }] : [])
      ]
    });
  }

  console.log(`✅ ${reports.length} sample reports created`);
  console.log('  Admin: manishsingh626332@gmail.com / MAnish345');
  console.log('  Officer: officer123@gmail.com / Officer123');
  console.log('  Citizen: citizen123@gmail.com / Citizen123');
  console.log(`  Reports: ${reports.length} sample reports`);

  await mongoose.disconnect();
}

seed().catch(console.error);