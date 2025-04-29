const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CONFIG = require('./config/config');
const User = require('./models/UserModel');
const Product = require('./models/ProductModel');
const SafetyEquipment = require('./models/SafetyEquipmentModel');

// Connect to MongoDB
mongoose.connect(CONFIG.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed admin user
const seedAdminUser = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    const adminUser = new User({
      username: 'admin',
      password: 'adminpassword',
      name: 'Usuario Admin',
      role: 'admin',
      permissions: [
        'view_products', 
        'manage_products', 
        'view_equipment', 
        'manage_equipment', 
        'view_reservations', 
        'manage_reservations', 
        'process_payments', 
        'manage_users'
      ]
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    
    const staffUser = new User({
      username: 'staff',
      password: 'staffpassword',
      name: 'Usuario Staff',
      role: 'staff',
      permissions: [
        'view_products',
        'view_equipment',
        'view_reservations',
        'process_payments'
      ]
    });
    
    await staffUser.save();
    console.log('Staff user created successfully');
    
  } catch (error) {
    console.error('Error creating users:', error);
  }
};

const seedProducts = async () => {
  try {
    await Product.deleteMany({});
    
    const products = [
      {
        type: 'JetSki',
        quantity: 5,
        price: 100,
        status: 'available'
      },
      {
        type: 'ATV',
        quantity: 3,
        price: 80,
        status: 'available'
      },
      {
        type: 'DivingEquipment',
        quantity: 10,
        price: 40,
        status: 'available'
      },
      {
        type: 'Surfboard',
        sizeCategory: 'adult',
        quantity: 8,
        price: 25,
        status: 'available'
      },
      {
        type: 'Surfboard',
        sizeCategory: 'child',
        quantity: 5,
        price: 15,
        status: 'available'
      }
    ];
    
    await Product.insertMany(products);
    console.log('Products seeded successfully');
    
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const seedSafetyEquipment = async () => {
  try {
    await SafetyEquipment.deleteMany({});
    
    const equipment = [
      {
        type: 'Helmet',
        size: 'S',
        quantity: 5,
        status: 'available'
      },
      {
        type: 'Helmet',
        size: 'M',
        quantity: 10,
        status: 'available'
      },
      {
        type: 'Helmet',
        size: 'L',
        quantity: 8,
        status: 'available'
      },
      {
        type: 'LifeJacket',
        size: 'S',
        quantity: 5,
        status: 'available'
      },
      {
        type: 'LifeJacket',
        size: 'M',
        quantity: 10,
        status: 'available'
      },
      {
        type: 'LifeJacket',
        size: 'L',
        quantity: 8,
        status: 'available'
      }
    ];
    
    await SafetyEquipment.insertMany(equipment);
    console.log('Safety equipment seeded successfully');
    
  } catch (error) {
    console.error('Error seeding safety equipment:', error);
  }
};

// Run the seed functions
const seedAll = async () => {
  await seedAdminUser();
  await seedProducts();
  await seedSafetyEquipment();
  
  console.log('Database seeding completed!');
  mongoose.connection.close();
};

seedAll();
