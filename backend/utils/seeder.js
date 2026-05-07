const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const sampleUsers = [
  { name: 'Admin User', email: 'admin@ecommerce.com', password: 'Admin1234', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', password: 'User1234', role: 'user' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'User1234', role: 'user' },
];

const sampleProducts = (adminId) => [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 30hr battery life.',
    price: 299.99, discountPrice: 249.99,
    category: 'Electronics', brand: 'SoundPro',
    images: [{ public_id: 'sample_1', url: 'https://via.placeholder.com/600x600?text=Headphones' }],
    stock: 50, isFeatured: true, createdBy: adminId,
  },
  {
    name: 'Classic Oxford Shirt',
    description: 'Premium cotton Oxford shirt, perfect for business casual occasions.',
    price: 79.99, discountPrice: null,
    category: 'Clothing', brand: 'StyleCo',
    images: [{ public_id: 'sample_2', url: 'https://via.placeholder.com/600x600?text=Shirt' }],
    stock: 120, isFeatured: true, createdBy: adminId,
  },
  {
    name: 'Running Shoes Pro',
    description: 'Lightweight performance running shoes with responsive foam cushioning.',
    price: 129.99, discountPrice: 99.99,
    category: 'Footwear', brand: 'RunFast',
    images: [{ public_id: 'sample_3', url: 'https://via.placeholder.com/600x600?text=Shoes' }],
    stock: 75, isFeatured: true, createdBy: adminId,
  },
  {
    name: 'Smart Watch Series X',
    description: 'Advanced smartwatch with health monitoring, GPS, and 5-day battery.',
    price: 399.99, discountPrice: 349.99,
    category: 'Electronics', brand: 'TechWear',
    images: [{ public_id: 'sample_4', url: 'https://via.placeholder.com/600x600?text=SmartWatch' }],
    stock: 30, isFeatured: true, createdBy: adminId,
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Genuine leather crossbody bag with multiple compartments.',
    price: 149.99, discountPrice: null,
    category: 'Accessories', brand: 'LuxLeather',
    images: [{ public_id: 'sample_5', url: 'https://via.placeholder.com/600x600?text=Bag' }],
    stock: 40, isFeatured: false, createdBy: adminId,
  },

  // const sampleProducts = (adminId) => [

  // ELECTRONICS
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple flagship smartphone with A17 Pro chip.',
    price: 1299,
    discountPrice: 1199,
    category: 'Electronics',
    brand: 'Apple',
    images: [{
      public_id: 'sample_1',
      url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569'
    }],
    stock: 15,
    isFeatured: true,
    createdBy: adminId,
  },

  {
    name: 'MacBook Air M2',
    description: 'Lightweight and powerful laptop for productivity.',
    price: 1499,
    discountPrice: 1399,
    category: 'Electronics',
    brand: 'Apple',
    images: [{
      public_id: 'sample_2',
      url: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8'
    }],
    stock: 10,
    isFeatured: true,
    createdBy: adminId,
  },

  {
    name: 'Sony WH-1000XM5',
    description: 'Premium noise cancelling wireless headphones.',
    price: 399,
    discountPrice: 349,
    category: 'Electronics',
    brand: 'Sony',
    images: [{
      public_id: 'sample_3',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    }],
    stock: 25,
    isFeatured: false,
    createdBy: adminId,
  },

  // CLOTHING
  {
    name: 'Oversized Hoodie',
    description: 'Soft cotton oversized hoodie for everyday wear.',
    price: 59,
    discountPrice: 45,
    category: 'Clothing',
    brand: 'H&M',
    images: [{
      public_id: 'sample_4',
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'
    }],
    stock: 40,
    isFeatured: true,
    createdBy: adminId,
  },

  {
    name: 'Slim Fit Jeans',
    description: 'Comfortable slim fit denim jeans.',
    price: 79,
    discountPrice: 65,
    category: 'Clothing',
    brand: "Levi's",
    images: [{
      public_id: 'sample_5',
      url: 'https://images.unsplash.com/photo-1542272604-787c3835535d'
    }],
    stock: 35,
    isFeatured: false,
    createdBy: adminId,
  },

  // FOOTWEAR
  {
    name: 'Nike Air Max',
    description: 'Stylish and comfortable running shoes.',
    price: 149,
    discountPrice: 129,
    category: 'Footwear',
    brand: 'Nike',
    images: [{
      public_id: 'sample_6',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
    }],
    stock: 30,
    isFeatured: true,
    createdBy: adminId,
  },

  {
    name: 'Adidas Ultraboost',
    description: 'High-performance sports footwear.',
    price: 169,
    discountPrice: 149,
    category: 'Footwear',
    brand: 'Adidas',
    images: [{
      public_id: 'sample_7',
      url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519'
    }],
    stock: 20,
    isFeatured: false,
    createdBy: adminId,
  },

  // ACCESSORIES
  {
    name: 'Leather Crossbody Bag',
    description: 'Premium leather bag with modern design.',
    price: 149,
    discountPrice: 119,
    category: 'Accessories',
    brand: 'LuxLeather',
    images: [{
      public_id: 'sample_8',
      url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3'
    }],
    stock: 18,
    isFeatured: true,
    createdBy: adminId,
  },

  {
    name: 'Ray-Ban Aviator Sunglasses',
    description: 'Classic aviator sunglasses with UV protection.',
    price: 199,
    discountPrice: 169,
    category: 'Accessories',
    brand: 'Ray-Ban',
    images: [{
      public_id: 'sample_9',
      url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083'
    }],
    stock: 22,
    isFeatured: false,
    createdBy: adminId,
  },

  // BOOKS
  {
    name: 'Atomic Habits',
    description: 'Bestselling self-improvement book by James Clear.',
    price: 19,
    discountPrice: 15,
    category: 'Books',
    brand: 'Penguin',
    images: [{
      public_id: 'sample_10',
      url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794'
    }],
    stock: 50,
    isFeatured: true,
    createdBy: adminId,
  },


  {
    name: 'Stainless Steel Water Bottle',
    description: '32oz double-wall insulated bottle, keeps drinks cold 24hrs or hot 12hrs.',
    price: 34.99, discountPrice: null,
    category: 'Sports', brand: 'HydroMax',
    images: [{ public_id: 'sample_6', url: 'https://via.placeholder.com/600x600?text=Bottle' }],
    stock: 200, isFeatured: false, createdBy: adminId,
  },
];

const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    const users = await User.insertMany(sampleUsers);
    const adminId = users[0]._id;
    await Product.insertMany(sampleProducts(adminId));

    console.log('✅ Data imported successfully!');
    console.log('Admin: admin@ecommerce.com / Admin1234');
    console.log('User:  john@example.com / User1234');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('✅ Data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
