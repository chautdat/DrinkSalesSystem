require('dotenv').config();

let mongoose = require('mongoose');
let slugify = require('slugify');
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');
let categoryModel = require('../schemas/categories');
let brandModel = require('../schemas/brands');
let paymentMethodModel = require('../schemas/paymentMethods');
let promotionModel = require('../schemas/promotions');
let productModel = require('../schemas/products');
let productImageModel = require('../schemas/productImages');

function makeImageUrl(label, background, foreground) {
  return `https://placehold.co/640x480/${background}/${foreground}?text=${encodeURIComponent(label)}`;
}

function requireSeedDocId(map, key) {
  let doc = map[key];
  if (!doc) {
    throw new Error(`Missing seed reference: ${key}`);
  }
  return doc._id;
}

async function upsertProduct(seedProduct) {
  return productModel.findOneAndUpdate(
    { sku: seedProduct.sku },
    {
      $set: {
        sku: seedProduct.sku,
        title: seedProduct.title,
        price: seedProduct.price,
        stock: seedProduct.stock,
        description: seedProduct.description,
        category: seedProduct.category,
        brand: seedProduct.brand,
        images: seedProduct.images
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function upsertProductImage(productId, imageUrl, isPrimary) {
  return productImageModel.findOneAndUpdate(
    {
      product: productId,
      imageUrl: imageUrl
    },
    {
      $setOnInsert: {
        product: productId,
        imageUrl: imageUrl,
        isPrimary: !!isPrimary
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

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

  let categorySeeds = [
    {
      name: 'Nước khoáng',
      image: 'https://placehold.co/640x480/38bdf8/ffffff?text=Nuoc+Khoang'
    },
    {
      name: 'Nước tinh khiết',
      image: 'https://placehold.co/640x480/0ea5e9/ffffff?text=Nuoc+Tinh+Khiet'
    },
    {
      name: 'Nước suối',
      image: 'https://placehold.co/640x480/34d399/ffffff?text=Nuoc+Suoi'
    },
    {
      name: 'Nước tăng lực',
      image: 'https://placehold.co/640x480/f59e0b/ffffff?text=Nuoc+Tang+Luc'
    },
    {
      name: 'Nước ngọt có gas',
      image: 'https://placehold.co/640x480/ec4899/ffffff?text=Nuoc+Ngot'
    },
    {
      name: 'Trà đóng chai',
      image: 'https://placehold.co/640x480/8b5cf6/ffffff?text=Tra+Dong+Chai'
    },
    {
      name: 'Nước trái cây',
      image: 'https://placehold.co/640x480/ef4444/ffffff?text=Nuoc+Trai+Cay'
    },
    {
      name: 'Nước detox',
      image: 'https://placehold.co/640x480/14b8a6/ffffff?text=Nuoc+Detox'
    }
  ];

  for (let categorySeed of categorySeeds) {
    await categoryModel.updateOne(
      { name: categorySeed.name },
      {
        $setOnInsert: {
          name: categorySeed.name,
          slug: slugify(categorySeed.name, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: true
          }),
          image: categorySeed.image
        }
      },
      { upsert: true }
    );
  }

  let brandSeeds = [
    {
      name: 'La Vie',
      description: 'Thương hiệu nước khoáng La Vie',
      image: 'https://placehold.co/640x480/f97316/ffffff?text=La+Vie',
      isActive: true
    },
    {
      name: 'Aquafina',
      description: 'Thương hiệu nước tinh khiết Aquafina',
      image: 'https://placehold.co/640x480/0284c7/ffffff?text=Aquafina',
      isActive: true
    },
    {
      name: 'Vĩnh Hảo',
      description: 'Thương hiệu nước khoáng thiên nhiên Vĩnh Hảo',
      image: 'https://placehold.co/640x480/16a34a/ffffff?text=Vinh+Hao',
      isActive: true
    },
    {
      name: 'Satori',
      description: 'Thương hiệu nước tinh khiết Satori',
      image: 'https://placehold.co/640x480/8b5cf6/ffffff?text=Satori',
      isActive: true
    },
    {
      name: 'Ion Life',
      description: 'Thương hiệu nước kiềm Ion Life',
      image: 'https://placehold.co/640x480/14b8a6/ffffff?text=Ion+Life',
      isActive: true
    },
    {
      name: 'Dasani',
      description: 'Thương hiệu nước tinh khiết Dasani',
      image: 'https://placehold.co/640x480/2563eb/ffffff?text=Dasani',
      isActive: true
    },
    {
      name: 'Evian',
      description: 'Thương hiệu nước khoáng Evian',
      image: 'https://placehold.co/640x480/ec4899/ffffff?text=Evian',
      isActive: true
    },
    {
      name: 'Vikoda',
      description: 'Thương hiệu nước khoáng Vikoda',
      image: 'https://placehold.co/640x480/f59e0b/ffffff?text=Vikoda',
      isActive: true
    }
  ];

  for (let brandSeed of brandSeeds) {
    await brandModel.updateOne(
      { name: brandSeed.name },
      {
        $setOnInsert: {
          name: brandSeed.name,
          slug: slugify(brandSeed.name, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: true
          }),
          description: brandSeed.description,
          image: brandSeed.image,
          isActive: brandSeed.isActive !== undefined ? brandSeed.isActive : true
        }
      },
      { upsert: true }
    );
  }

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

  let promotionSeeds = [
    {
      code: 'WELCOME10',
      discount: 10,
      applyFor: 'Tất cả',
      expireDate: new Date('2026-12-31T23:59:59.000Z'),
      usageCount: 0,
      maxUsage: 0,
      isActive: true
    },
    {
      code: 'SUMMER15',
      discount: 15,
      applyFor: 'Đơn hàng',
      expireDate: new Date('2026-08-31T23:59:59.000Z'),
      usageCount: 0,
      maxUsage: 100,
      isActive: true
    },
    {
      code: 'FREESHIP',
      discount: 5,
      applyFor: 'Giao hàng',
      expireDate: new Date('2026-12-31T23:59:59.000Z'),
      usageCount: 0,
      maxUsage: 200,
      isActive: true
    }
  ];

  for (let promotionSeed of promotionSeeds) {
    await promotionModel.updateOne(
      { code: promotionSeed.code },
      {
        $setOnInsert: {
          code: promotionSeed.code,
          discount: promotionSeed.discount,
          applyFor: promotionSeed.applyFor,
          expireDate: promotionSeed.expireDate,
          usageCount: promotionSeed.usageCount,
          maxUsage: promotionSeed.maxUsage,
          isActive: promotionSeed.isActive,
          isDeleted: false
        }
      },
      { upsert: true }
    );
  }

  let categories = await categoryModel.find({ isDeleted: false });
  let brands = await brandModel.find({ isDeleted: false });
  let categoryMap = {};
  let brandMap = {};

  categories.forEach(function (category) {
    categoryMap[category.name] = category;
  });
  brands.forEach(function (brand) {
    brandMap[brand.name] = brand;
  });

  let purifiedCategoryId = requireSeedDocId(categoryMap, 'Nước tinh khiết');
  let mineralCategoryId = requireSeedDocId(categoryMap, 'Nước khoáng');
  let aquafinaBrandId = requireSeedDocId(brandMap, 'Aquafina');
  let laVieBrandId = requireSeedDocId(brandMap, 'La Vie');
  let vinhHaoBrandId = requireSeedDocId(brandMap, 'Vĩnh Hảo');
  let satoriBrandId = requireSeedDocId(brandMap, 'Satori');
  let ionLifeBrandId = requireSeedDocId(brandMap, 'Ion Life');
  let dasaniBrandId = requireSeedDocId(brandMap, 'Dasani');
  let evianBrandId = requireSeedDocId(brandMap, 'Evian');
  let vikodaBrandId = requireSeedDocId(brandMap, 'Vikoda');

  let productSeeds = [
    {
      sku: 'AQA-350',
      title: 'Aquafina 350ml',
      price: 8000,
      stock: 240,
      description: 'Nước tinh khiết Aquafina chai nhỏ tiện mang theo.',
      category: purifiedCategoryId,
      brand: aquafinaBrandId,
      images: [makeImageUrl('Aquafina 350ml', '38bdf8', 'ffffff')]
    },
    {
      sku: 'AQA-500',
      title: 'Aquafina 500ml',
      price: 10000,
      stock: 320,
      description: 'Chai Aquafina phổ biến cho nhu cầu sử dụng hằng ngày.',
      category: purifiedCategoryId,
      brand: aquafinaBrandId,
      images: [makeImageUrl('Aquafina 500ml', '0284c7', 'ffffff')]
    },
    {
      sku: 'AQA-1500',
      title: 'Aquafina 1.5L',
      price: 18000,
      stock: 180,
      description: 'Bình Aquafina dung tích lớn phù hợp gia đình hoặc văn phòng.',
      category: purifiedCategoryId,
      brand: aquafinaBrandId,
      images: [makeImageUrl('Aquafina 1.5L', '0f766e', 'ffffff')]
    },
    {
      sku: 'AQA-19L',
      title: 'Aquafina bình 19L',
      price: 65000,
      stock: 60,
      description: 'Bình lớn cho văn phòng, cửa hàng và hộ gia đình.',
      category: purifiedCategoryId,
      brand: aquafinaBrandId,
      images: [makeImageUrl('Aquafina 19L', '0ea5e9', 'ffffff')]
    },
    {
      sku: 'LAV-350',
      title: 'La Vie 350ml',
      price: 7000,
      stock: 260,
      description: 'Nước khoáng La Vie chai nhỏ tiện lợi.',
      category: mineralCategoryId,
      brand: laVieBrandId,
      images: [makeImageUrl('La Vie 350ml', 'fb923c', 'ffffff')]
    },
    {
      sku: 'LAV-500',
      title: 'La Vie 500ml',
      price: 9000,
      stock: 300,
      description: 'Chai La Vie dung tích phổ biến cho tiêu dùng hằng ngày.',
      category: mineralCategoryId,
      brand: laVieBrandId,
      images: [makeImageUrl('La Vie 500ml', 'f97316', 'ffffff')]
    },
    {
      sku: 'LAV-1500',
      title: 'La Vie 1.5L',
      price: 17000,
      stock: 150,
      description: 'Chai dung tích lớn cho gia đình và văn phòng.',
      category: mineralCategoryId,
      brand: laVieBrandId,
      images: [makeImageUrl('La Vie 1.5L', 'c2410c', 'ffffff')]
    },
    {
      sku: 'LAV-19L',
      title: 'La Vie bình 19L',
      price: 60000,
      stock: 40,
      description: 'Bình 19L phục vụ cho giao hàng định kỳ.',
      category: mineralCategoryId,
      brand: laVieBrandId,
      images: [makeImageUrl('La Vie 19L', 'be123c', 'ffffff')]
    },
    {
      sku: 'VINH-350',
      title: 'Vĩnh Hảo 350ml',
      price: 7000,
      stock: 280,
      description: 'Nước khoáng Vĩnh Hảo chai nhỏ cho nhu cầu hằng ngày.',
      category: mineralCategoryId,
      brand: vinhHaoBrandId,
      images: [makeImageUrl('Vinh Hao 350ml', '16a34a', 'ffffff')]
    },
    {
      sku: 'VINH-500',
      title: 'Vĩnh Hảo 500ml',
      price: 9000,
      stock: 260,
      description: 'Chai Vĩnh Hảo dung tích phổ biến, dễ mang theo.',
      category: mineralCategoryId,
      brand: vinhHaoBrandId,
      images: [makeImageUrl('Vinh Hao 500ml', '15803d', 'ffffff')]
    },
    {
      sku: 'VINH-1500',
      title: 'Vĩnh Hảo 1.5L',
      price: 17000,
      stock: 160,
      description: 'Chai Vĩnh Hảo dung tích lớn cho gia đình và văn phòng.',
      category: mineralCategoryId,
      brand: vinhHaoBrandId,
      images: [makeImageUrl('Vinh Hao 1.5L', '166534', 'ffffff')]
    },
    {
      sku: 'SAT-500',
      title: 'Satori 500ml',
      price: 8500,
      stock: 300,
      description: 'Nước tinh khiết Satori chai 500ml tiện lợi.',
      category: purifiedCategoryId,
      brand: satoriBrandId,
      images: [makeImageUrl('Satori 500ml', '8b5cf6', 'ffffff')]
    },
    {
      sku: 'SAT-1500',
      title: 'Satori 1.5L',
      price: 16000,
      stock: 180,
      description: 'Chai Satori 1.5L phù hợp gia đình và văn phòng.',
      category: purifiedCategoryId,
      brand: satoriBrandId,
      images: [makeImageUrl('Satori 1.5L', '7c3aed', 'ffffff')]
    },
    {
      sku: 'SAT-19L',
      title: 'Satori bình 19L',
      price: 62000,
      stock: 50,
      description: 'Bình 19L Satori phục vụ giao hàng định kỳ.',
      category: purifiedCategoryId,
      brand: satoriBrandId,
      images: [makeImageUrl('Satori 19L', '6d28d9', 'ffffff')]
    },
    {
      sku: 'ION-350',
      title: 'Ion Life 350ml',
      price: 9000,
      stock: 220,
      description: 'Nước kiềm Ion Life chai nhỏ tiện mang theo.',
      category: purifiedCategoryId,
      brand: ionLifeBrandId,
      images: [makeImageUrl('Ion Life 350ml', '14b8a6', 'ffffff')]
    },
    {
      sku: 'ION-500',
      title: 'Ion Life 500ml',
      price: 11000,
      stock: 240,
      description: 'Ion Life chai 500ml cho nhu cầu sử dụng hằng ngày.',
      category: purifiedCategoryId,
      brand: ionLifeBrandId,
      images: [makeImageUrl('Ion Life 500ml', '0f766e', 'ffffff')]
    },
    {
      sku: 'ION-1500',
      title: 'Ion Life 1.5L',
      price: 19000,
      stock: 140,
      description: 'Ion Life dung tích lớn phù hợp gia đình và văn phòng.',
      category: purifiedCategoryId,
      brand: ionLifeBrandId,
      images: [makeImageUrl('Ion Life 1.5L', '0d9488', 'ffffff')]
    },
    {
      sku: 'DAS-500',
      title: 'Dasani 500ml',
      price: 9000,
      stock: 260,
      description: 'Dasani chai 500ml cho nhu cầu uống hàng ngày.',
      category: purifiedCategoryId,
      brand: dasaniBrandId,
      images: [makeImageUrl('Dasani 500ml', '2563eb', 'ffffff')]
    },
    {
      sku: 'DAS-1500',
      title: 'Dasani 1.5L',
      price: 17500,
      stock: 150,
      description: 'Dasani 1.5L phù hợp gia đình và văn phòng.',
      category: purifiedCategoryId,
      brand: dasaniBrandId,
      images: [makeImageUrl('Dasani 1.5L', '1d4ed8', 'ffffff')]
    },
    {
      sku: 'EVI-500',
      title: 'Evian 500ml',
      price: 15000,
      stock: 180,
      description: 'Nước khoáng Evian chai 500ml nhập khẩu.',
      category: mineralCategoryId,
      brand: evianBrandId,
      images: [makeImageUrl('Evian 500ml', 'ec4899', 'ffffff')]
    },
    {
      sku: 'EVI-1500',
      title: 'Evian 1.5L',
      price: 25000,
      stock: 120,
      description: 'Evian 1.5L phù hợp cho gia đình và văn phòng.',
      category: mineralCategoryId,
      brand: evianBrandId,
      images: [makeImageUrl('Evian 1.5L', 'db2777', 'ffffff')]
    },
    {
      sku: 'VIK-350',
      title: 'Vikoda 350ml',
      price: 8000,
      stock: 210,
      description: 'Nước khoáng Vikoda chai nhỏ tiện lợi.',
      category: mineralCategoryId,
      brand: vikodaBrandId,
      images: [makeImageUrl('Vikoda 350ml', 'f59e0b', 'ffffff')]
    },
    {
      sku: 'VIK-1500',
      title: 'Vikoda 1.5L',
      price: 18000,
      stock: 130,
      description: 'Vikoda 1.5L cho gia đình và văn phòng.',
      category: mineralCategoryId,
      brand: vikodaBrandId,
      images: [makeImageUrl('Vikoda 1.5L', 'd97706', 'ffffff')]
    }
  ];

  for (let seedProduct of productSeeds) {
    let product = await upsertProduct(seedProduct);
    await upsertProductImage(product._id, seedProduct.images[0], true);
  }

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

  console.log('Seed completed with sample products');
  process.exit(0);
}

seed().catch(function (error) {
  console.error(error);
  process.exit(1);
});
