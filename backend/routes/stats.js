const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/overview', async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, users] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'in_progress' }),
      Report.countDocuments({ status: 'resolved' }),
      User.countDocuments()
    ]);

    const categoryCounts = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const last7Days = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const severityCounts = await Report.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.json({
      total, pending, inProgress, resolved, users,
      categoryCounts, last7Days, severityCounts,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('name avatar points reportsSubmitted reportsResolved badges')
      .sort({ points: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
