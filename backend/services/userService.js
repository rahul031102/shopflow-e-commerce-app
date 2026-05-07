const User = require('../models/User');
const AppError = require('../utils/AppError');

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'phone', 'avatar'];
  const filtered = {};
  allowedFields.forEach((f) => { if (updateData[f] !== undefined) filtered[f] = updateData[f]; });

  const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(addressData);
  await user.save();
  return user;
};

const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const address = user.addresses.id(addressId);
  if (!address) throw new AppError('Address not found', 404);

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, addressData);
  await user.save();
  return user;
};

const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const address = user.addresses.id(addressId);
  if (!address) throw new AppError('Address not found', 404);

  address.deleteOne();
  await user.save();
  return user;
};

module.exports = { getUserProfile, updateUserProfile, addAddress, updateAddress, deleteAddress };
