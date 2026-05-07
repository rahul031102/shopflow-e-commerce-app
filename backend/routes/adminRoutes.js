const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
