var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var cartsRouter = require('./routes/carts');
var brandsRouter = require('./routes/brands');
var categoriesRouter = require('./routes/categories');
var productsRouter = require('./routes/products');
var rolesRouter = require('./routes/roles');
var paymentMethodsRouter = require('./routes/paymentMethods');
var reportsRouter = require('./routes/reports');
var productImagesRouter = require('./routes/productImages');
var uploadRouter = require('./routes/upload');
var messagesRouter = require('./routes/messages');
var ordersRouter = require('./routes/orders');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/carts', cartsRouter);
app.use('/api/v1/brands', brandsRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/product-images', productImagesRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/roles', rolesRouter);
app.use('/api/v1/payment-methods', paymentMethodsRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/orders', ordersRouter);

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drink_sales_system');
mongoose.connection.on('connected', function () {
  console.log('connected');
});
mongoose.connection.on('disconnected', function () {
  console.log('disconnected');
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
