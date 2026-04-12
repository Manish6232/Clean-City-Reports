const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../middleware/cloudinary');

// Get all reports (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, severity, page = 1, limit = 10, lat, lng, radius = 5000 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;

    let query = Report.find(filter)
      .populate('reporter', 'name avatar email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const reports = await query;
    const total = await Report.countDocuments(filter);

    res.json({ reports, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get nearby reports
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    }).populate('reporter', 'name avatar').limit(50);

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name avatar email phone')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name avatar');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create report
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, severity, lat, lng, address, city, pincode } = req.body;

    const images = req.files ? req.files.map(f => ({ url: f.path, publicId: f.filename })) : [];

    const report = await Report.create({
      title,
      description,
      category,
      severity: severity || 'medium',
      images,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address || '',
        city: city || '',
        pincode: pincode || ''
      },
      reporter: req.user._id,
      statusHistory: [{ status: 'pending', updatedBy: req.user._id, note: 'Report submitted' }]
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reportsSubmitted: 1, points: 10 }
    });

    const populated = await Report.findById(report._id).populate('reporter', 'name avatar email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update report status (admin/officer)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    report.statusHistory.push({ status, updatedBy: req.user._id, note: note || '' });
    if (status === 'resolved') {
      report.resolvedAt = new Date();
      await User.findByIdAndUpdate(report.reporter, { $inc: { reportsResolved: 1, points: 20 } });
    }
    if (status === 'in_progress') report.assignedTo = req.user._id;

    await report.save();
    const updated = await Report.findById(report._id).populate('reporter', 'name avatar').populate('assignedTo', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upvote report
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const idx = report.upvotes.indexOf(req.user._id);
    if (idx > -1) report.upvotes.splice(idx, 1);
    else report.upvotes.push(req.user._id);

    await report.save();
    res.json({ upvotes: report.upvotes.length, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.comments.push({ user: req.user._id, text });
    await report.save();

    const updated = await Report.findById(report._id).populate('comments.user', 'name avatar');
    res.json(updated.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's reports
router.get('/user/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reporter', 'name avatar');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    if (report.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await report.deleteOne();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
