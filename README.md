# DrinkSalesSystem BE

Node.js + Express + MongoDB backend written in the same folder style as the reference repo:

- `app.js`
- `bin/www`
- `routes/`
- `controllers/`
- `schemas/`
- `utils/`

The backend now follows the sample project direction but stays on Node.js/MongoDB to match the teacher's rubric.

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
- Brand management
- Payment method management
- Product image management
- Revenue/top-product reports
- WebSocket room join/leave and typing events

## API routes

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/roles`
- `/api/v1/brands`
- `/api/v1/categories`
- `/api/v1/products`
- `/api/v1/product-images`
- `/api/v1/payment-methods`
- `/api/v1/reports`
- `/api/v1/carts`
- `/api/v1/messages`
- `/api/v1/upload`
- `/api/v1/orders`

## WebSocket events

- Server emits:
  - `socket:connected`
  - `message:new`
  - `order:created`
  - `order:updated`
- Client can join rooms with:
  - `join`
  - `user:join`
  - `conversation:join`
- Typing events:
  - `chat:typing`
  - `message:typing`

The chat rooms currently use the user ID, so the frontend should join the current user room after login.
