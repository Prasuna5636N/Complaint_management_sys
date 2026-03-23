const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Infrastructure', 'Billing', 'Service', 'Safety', 'Noise', 'Sanitation', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    adminNote: {
      type: String,
      default: '',
      maxlength: [500, 'Admin note cannot exceed 500 characters'],
    },
    resolvedAt: { type: Date },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate complaintId before saving
ComplaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP${String(count + 1).padStart(4, '0')}`;
  }
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, note: this.adminNote });
    if (this.status === 'Resolved') this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
