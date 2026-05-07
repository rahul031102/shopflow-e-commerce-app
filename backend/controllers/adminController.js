const asyncHandler = require('express-async-handler');
const adminService = require('../services/adminService');

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({ success: true, stats });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  res.status(200).json({ success: true, ...result });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

module.exports = { getDashboard, getAllUsers, updateUser, deleteUser };
