const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

/**
 * Returns aggregated stats for the admin dashboard.
 */
const getDashboardStats = async () => {
  const [totalUsers, totalProducts, orderStats, recentOrders, topProducts] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          paidOrders: { $sum: { $cond: ['$isPaid', 1, 0] } },
        },
      },
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    Product.find({ isActive: true }).sort({ numReviews: -1 }).limit(5).select('name images averageRating numReviews price stock'),
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders: orderStats[0]?.totalOrders || 0,
    totalRevenue: orderStats[0]?.totalRevenue || 0,
    paidOrders: orderStats[0]?.paidOrders || 0,
    recentOrders,
    topProducts,
    revenueByMonth,
  };
};

/**
 * Admin: get all users with pagination.
 */
const getAllUsers = async ({ page = 1, limit = 20, search, role }) => {
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (role) query.role = role;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password -refreshToken'),
    User.countDocuments(query),
  ]);

  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/**
 * Admin: update user role or active status.
 */
const updateUser = async (userId, updateData, adminId) => {
  if (userId.toString() === adminId.toString()) {
    throw new AppError('You cannot modify your own account via admin panel', 400);
  }

  const allowedFields = ['role', 'isActive'];
  const filteredData = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) filteredData[field] = updateData[field];
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, { new: true }).select('-password');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * Admin: delete a user account permanently.
 */
const deleteUser = async (userId, adminId) => {
  if (userId.toString() === adminId.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

module.exports = { getDashboardStats, getAllUsers, updateUser, deleteUser };
