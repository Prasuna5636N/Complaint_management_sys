const Complaint = require('../models/Complaint');

// @route GET /api/complaints  (admin: all | user: own)
exports.getComplaints = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };

    // Filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.priority) query.priority = req.query.priority;

    // Search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { complaintId: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: complaints.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      complaints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/complaints/:id
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email phone');
    if (!complaint)
      return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Users can only see their own
    if (req.user.role !== 'admin' && complaint.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { title, category, description, priority } = req.body;
    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      category,
      description,
      priority,
      statusHistory: [{ status: 'Pending', note: 'Complaint submitted' }],
    });
    await complaint.populate('user', 'name email');
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route PUT /api/complaints/:id  (admin only)
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { status, adminNote } = req.body;
    if (status) complaint.status = status;
    if (adminNote !== undefined) complaint.adminNote = adminNote;

    await complaint.save();
    await complaint.populate('user', 'name email');
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/complaints/:id  (admin only)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint)
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/complaints/stats  (admin only)
exports.getStats = async (req, res) => {
  try {
    const [statusStats, categoryStats, priorityStats, recentComplaints] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Complaint.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
    ]);
    res.json({ success: true, statusStats, categoryStats, priorityStats, recentComplaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
