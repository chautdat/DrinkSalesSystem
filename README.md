# DrinkSalesSystem BE

Node.js + Express + MongoDB backend written in the same folder style as the reference repo:

- `app.js`
- `bin/www`
- `routes/`
- `controllers/`
- `schemas/`
- `utils/`

## Run

```bash
npm install
cp .env.example .env
npm start
```

## Main features

- RESTful CRUD routes
- JWT authentication with cookie/Bearer support
- Role-based authorization
- Image upload
- Cart flow and checkout transaction
- Socket.IO message/order events

## API routes

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/roles`
- `/api/v1/categories`
- `/api/v1/products`
- `/api/v1/carts`
- `/api/v1/messages`
- `/api/v1/upload`
- `/api/v1/orders`
