let mongoose = require('mongoose');
let slugify = require('slugify');
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');
let categoryModel = require('../schemas/categories');
let brandModel = require('../schemas/brands');
let paymentMethodModel = require('../schemas/paymentMethods');

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

  await categoryModel.updateOne(
    { name: 'Nước khoáng' },
    {
      $setOnInsert: {
        name: 'Nước khoáng',
        slug: slugify('Nước khoáng', {
          replacement: '-',
          remove: undefined,
          lower: true,
          strict: true
        }),
        image: 'https://placeimg.com/640/480/nature'
      }
    },
    { upsert: true }
  );
  await categoryModel.updateOne(
    { name: 'Nước tinh khiết' },
    {
      $setOnInsert: {
        name: 'Nước tinh khiết',
        slug: slugify('Nước tinh khiết', {
          replacement: '-',
          remove: undefined,
          lower: true,
          strict: true
        }),
        image: 'https://placeimg.com/640/480/tech'
      }
    },
    { upsert: true }
  );

  await brandModel.updateOne(
    { name: 'La Vie' },
    {
      $setOnInsert: {
        name: 'La Vie',
        slug: slugify('La Vie', {
          replacement: '-',
          remove: undefined,
          lower: true,
          strict: true
        }),
        description: 'Thương hiệu nước khoáng La Vie',
        image: 'https://placeimg.com/640/480/tech',
        isActive: true
      }
    },
    { upsert: true }
  );
  await brandModel.updateOne(
    { name: 'Aquafina' },
    {
      $setOnInsert: {
        name: 'Aquafina',
        slug: slugify('Aquafina', {
          replacement: '-',
          remove: undefined,
          lower: true,
          strict: true
        }),
        description: 'Thương hiệu nước tinh khiết Aquafina',
        image: 'https://placeimg.com/640/480/arch',
        isActive: true
      }
    },
    { upsert: true }
  );

  await paymentMethodModel.updateOne(
    { code: 'COD' },
    {
      $setOnInsert: {
        name: 'Tiền mặt',
        code: 'COD',
        description: 'Thanh toán khi nhận hàng',
        isActive: true
      }
    },
    { upsert: true }
  );
  await paymentMethodModel.updateOne(
    { code: 'BANKING' },
    {
      $setOnInsert: {
        name: 'Chuyển khoản',
        code: 'BANKING',
        description: 'Thanh toán qua ngân hàng',
        isActive: true
      }
    },
    { upsert: true }
  );
  await paymentMethodModel.updateOne(
    { code: 'WALLET' },
    {
      $setOnInsert: {
        name: 'Ví điện tử',
        code: 'WALLET',
        description: 'Thanh toán qua ví điện tử',
        isActive: true
      }
    },
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
