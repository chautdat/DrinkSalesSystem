let mongoose = require('mongoose');
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drink_sales_system');

  await roleModel.updateOne(
    { name: 'admin' },
    { $setOnInsert: { name: 'admin', description: 'System administrator' } },
    { upsert: true }
  );
  await roleModel.updateOne(
    { name: 'staff' },
    { $setOnInsert: { name: 'staff', description: 'Store staff' } },
    { upsert: true }
  );
  await roleModel.updateOne(
    { name: 'customer' },
    { $setOnInsert: { name: 'customer', description: 'Customer account' } },
    { upsert: true }
  );

  let adminEmail = process.env.ADMIN_EMAIL;
  let adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    let exists = await userModel.findOne({ email: adminEmail.toLowerCase() });
    if (!exists) {
      await userModel.create({
        fullName: 'System Admin',
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
        status: true
      });
    }
  }

  console.log('Seed completed');
  process.exit(0);
}

seed().catch(function (error) {
  console.error(error);
  process.exit(1);
});
