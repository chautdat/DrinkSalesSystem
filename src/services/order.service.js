const mongoose = require('mongoose');
const ApiError = require('../utils/apiError');
const withTransaction = require('../utils/transaction');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

async function createOrder(userId, payload) {
  const { items = [], shippingAddress = {}, paymentMethod = 'cod', note = '' } =
    payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order items are required');
  }

  return withTransaction(async (session) => {
    const normalizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new ApiError(404, `Product not found: ${item.product}`);
      }

      const quantity = Math.max(1, Number(item.quantity || 1));
      const price = Number(product.salePrice || product.price || 0);
      const lineTotal = price * quantity;

      if (product.stock < quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for product ${product.name}`
        );
      }

      normalizedItems.push({
        product: product._id,
        productName: product.name,
        price,
        quantity,
        lineTotal,
      });

      subtotal += lineTotal;

      product.stock -= quantity;
      await product.save({ session });
    }

    const orderDocuments = await Order.create(
      [
        {
          user: new mongoose.Types.ObjectId(userId),
          items: normalizedItems,
          shippingAddress,
          paymentMethod,
          note,
          subtotal,
          total: subtotal,
        },
      ],
      { session }
    );

    return orderDocuments[0];
  });
}

module.exports = {
  createOrder,
};
