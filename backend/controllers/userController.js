const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  res.status(200).json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) {
    updateData.avatar = { public_id: req.file.filename, url: req.file.path };
  }
  const user = await userService.updateUserProfile(req.user._id, updateData);
  res.status(200).json({ success: true, user });
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await userService.addAddress(req.user._id, req.body);
  res.status(201).json({ success: true, addresses: user.addresses });
});

const updateAddress = asyncHandler(async (req, res) => {
  const user = await userService.updateAddress(req.user._id, req.params.addressId, req.body);
  res.status(200).json({ success: true, addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await userService.deleteAddress(req.user._id, req.params.addressId);
  res.status(200).json({ success: true, addresses: user.addresses });
});

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress };
