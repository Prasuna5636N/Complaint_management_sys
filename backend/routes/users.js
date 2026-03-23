const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateProfile, toggleUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, getAllUsers);
router.put('/profile', updateProfile);
router.get('/:id', adminOnly, getUser);
router.put('/:id/toggle', adminOnly, toggleUser);

module.exports = router;
