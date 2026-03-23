const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getStats,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // all routes require login

router.get('/stats', adminOnly, getStats);
router.route('/').get(getComplaints).post(createComplaint);
router.route('/:id').get(getComplaint).put(adminOnly, updateComplaint).delete(adminOnly, deleteComplaint);

module.exports = router;
