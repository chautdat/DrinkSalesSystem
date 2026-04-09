const connectDatabase = require('../config/database');
const env = require('../config/env');
const Role = require('../models/role.model');
const User = require('../models/user.model');

async function seed() {
  await connectDatabase(env.mongoUri);

  await Role.bulkWrite([
    {
      updateOne: {
        filter: { name: 'admin' },
        update: {
          $setOnInsert: {
            name: 'admin',
            description: 'System administrator',
            permissions: ['*'],
          },
        },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { name: 'staff' },
        update: {
          $setOnInsert: {
            name: 'staff',
            description: 'Store staff',
            permissions: ['read', 'write'],
          },
        },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { name: 'customer' },
        update: {
          $setOnInsert: {
            name: 'customer',
            description: 'Customer account',
            permissions: ['read'],
          },
        },
        upsert: true,
      },
    },
  ]);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const exists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!exists) {
      await User.create({
        fullName: 'System Admin',
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
      });
    }
  }

  console.log('Seed completed');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
