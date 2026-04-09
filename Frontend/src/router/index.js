import { createRouter, createWebHistory } from 'vue-router'
import Login        from '../views/Login.vue'
import Home         from '../views/Home.vue'
import AdminHome    from '../views/admin/AdminHome.vue'
import UserHome     from '../views/user/UserHome.vue'
import Products     from '../views/admin/Products.vue'
import Orders       from '../views/admin/Orders.vue'
import Dashboard    from '../views/Dashboard.vue'
import UserShop     from '../views/user/UserShop.vue'
import UserCart     from '../views/user/UserCart.vue'
import UserOrders   from '../views/user/UserOrders.vue'
import UserProfile  from '../views/user/UserProfile.vue'
import PaymentMethods from '../views/admin/PaymentMethods.vue'
import Brands         from '../views/admin/Brands.vue'
import ProductImages   from '../views/admin/ProductImages.vue'

// ── Bổ sung các route admin mới theo nghiệp vụ ──────────────────────────────
import Users        from '../views/admin/Users.vue'        // Quản lý khách hàng
import Admins       from '../views/admin/Admins.vue'       // Quản lý tài khoản Admin

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          redirect: '/login' },
    { path: '/login',     component: Login   },

    // ── Shared Home (redirect theo role) ─────────────────────────────────────
    { path: '/home-legacy', component: Home, meta: { requiresAuth: true } },
    { path: '/products', redirect: '/shop' },
    { path: '/dashboard', redirect: '/admin/dashboard' },

    // ── Admin routes ─────────────────────────────────────────────────────────
    { path: '/admin',            component: AdminHome,  meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/products',   component: Products,   meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/orders',     component: Orders,     meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/dashboard',  component: Dashboard,  meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/users',      component: Users,      meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/admins',     component: Admins,     meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/payment-methods', component: PaymentMethods, meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/brands',          component: Brands,         meta: { requiresAuth: true, adminOnly: true } },
    { path: '/admin/product-images',   component: ProductImages,   meta: { requiresAuth: true, adminOnly: true } },

    // ── User routes ──────────────────────────────────────────────────────────
    { path: '/home',    component: UserHome,    meta: { requiresAuth: true, userOnly: true } },
    { path: '/shop',    component: UserShop,    meta: { requiresAuth: true, userOnly: true } },
    { path: '/cart',    component: UserCart,    meta: { requiresAuth: true, userOnly: true } },
    { path: '/orders',  component: UserOrders,  meta: { requiresAuth: true, userOnly: true } },
    { path: '/profile', component: UserProfile, meta: { requiresAuth: true, userOnly: true } },

    // ── Fallback ─────────────────────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

router.beforeEach((to) => {
  const token = sessionStorage.getItem('token')
  const user  = JSON.parse(sessionStorage.getItem('user') || '{}')
  const isAdmin = (user.role || '').toLowerCase() === 'admin'

  // Đã đăng nhập mà vào /login → redirect đúng trang chủ theo role
  if (to.path === '/login' && token) {
    return isAdmin ? '/admin' : '/home'
  }

  // Chưa đăng nhập mà vào route cần auth
  if (to.meta.requiresAuth && !token) return '/login'

  // Admin vào route userOnly → về admin
  if (to.meta.userOnly && isAdmin) return '/admin'

  // User vào route adminOnly → về home
  if (to.meta.adminOnly && !isAdmin) return '/home'
})

export default router
